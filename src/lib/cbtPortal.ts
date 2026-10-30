import Papa from 'papaparse';
import { jsPDF } from 'jspdf';
import { supabase } from '@/integrations/supabase/client';
export interface StudentRegistration {
  user_id: string; roll_number: string; full_name: string; class: string; stream: string; institute: string;
  academic_session: string; batch: string; guardian_name?: string | null; school?: string | null;
  course?: string | null; city?: string | null; status: string; admin_note?: string | null; created_at: string;
  extra_details: Record<string,string>;
}
export const registrationFields = [
  ['full_name','Full name',true], ['class','Class',true], ['stream','Stream',true], ['institute','Coaching institute',true],
  ['academic_session','Academic session',true], ['batch','Batch',true], ['guardian_name',"Father’s / guardian’s name",false],
  ['school','School',false], ['course','Course',false], ['city','City',false],
] as const;
export async function portalRpc<T = unknown>(fn: string, args: Record<string,unknown> = {}): Promise<T> {
  const { data, error } = await (supabase.rpc as any)(fn,args);
  if (error) throw new Error(error.message);
  return data as T;
}
export async function signInWithRoll(roll_number: string,password: string) {
  const { data,error } = await supabase.functions.invoke('cbt-auth',{ body:{ roll_number,password } });
  if (error || data?.error) throw new Error(data?.error ?? 'Sign-in failed. Check your roll number and password.');
  const { error: sessionError } = await supabase.auth.setSession({access_token:data.access_token,refresh_token:data.refresh_token});
  if (sessionError) throw sessionError;
}
export interface ImportedQuestion {
  text: string; options: string[]; correct: number[]; multi: boolean; subject: string; topic: string;
  explanation: string; marks: number | null; negative: number | null; image_url?: string | null;
}
export const CSV_TEMPLATE = 'text,option_a,option_b,option_c,option_d,option_e,correct,multi,subject,topic,explanation,marks,negative\n';
export function parseQuestionCsv(csv: string): { questions: ImportedQuestion[]; errors: string[] } {
  const parsed = Papa.parse<Record<string,string>>(csv, { header:true,skipEmptyLines:'greedy',transformHeader:h=>h.trim().toLowerCase() });
  const errors = parsed.errors.map(e=>`Row ${(e.row ?? 0)+2}: ${e.message}`);
  const required=['text','option_a','option_b','option_c','option_d','correct'];
  for (const key of required) if (!parsed.meta.fields?.includes(key)) errors.push(`Missing column: ${key}`);
  if (!parsed.data.length || parsed.data.length>500) errors.push('Import between 1 and 500 questions.');
  const questions=parsed.data.map((r,i)=>{
    const options=['option_a','option_b','option_c','option_d'].map(k=>(r[k]??'').trim());
    if (r.option_e?.trim()) options.push(r.option_e.trim());
    const raw=(r.correct??'').toUpperCase().split(/[;|\s]+/).filter(Boolean);
    const correct=[...new Set(raw.map(x=>'ABCDE'.indexOf(x)))];
    const multi=(r.multi??'false').trim().toLowerCase();
    const marks=r.marks?.trim()?Number(r.marks):null; const negative=r.negative?.trim()?Number(r.negative):null;
    if (!r.text?.trim() || options.some(o=>!o)) errors.push(`Row ${i+2}: question and four or five options are required.`);
    if (!raw.length || raw.some(x=>x.length!==1) || correct.some(c=>c<0 || c>=options.length)) errors.push(`Row ${i+2}: answers must be option letters A–E, separated by semicolons.`);
    if (!['true','false'].includes(multi) || (multi!=='true' && correct.length!==1)) errors.push(`Row ${i+2}: single-correct questions need one answer; multi must be true or false.`);
    if ([marks,negative].some(n=>n!==null && (!Number.isFinite(n)||n<0))) errors.push(`Row ${i+2}: marks must be finite, nonnegative numbers.`);
    return {text:r.text?.trim()??'',options,correct,multi:multi==='true',subject:r.subject?.trim()??'',topic:r.topic?.trim()??'',explanation:r.explanation??'',marks,negative};
  });
  return { questions: errors.length ? []:questions, errors };
}
export function downloadText(name:string,text:string,type='text/csv') {
  const url=URL.createObjectURL(new Blob([text],{type})); const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export function createReportPdf(title:string,lines:string[]) {
  const doc=new jsPDF(); let y=20; doc.setFontSize(17);doc.text(title,15,y);y+=12;doc.setFontSize(10);
  for (const line of lines) {
    for (const wrapped of doc.splitTextToSize(line,180)) { if(y>280){doc.addPage();y=20;}doc.text(wrapped,15,y);y+=6; }
    y+=2;
  }
  return doc;
}
export { cardPdf } from './admitCard';