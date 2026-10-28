import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowDown, ArrowUp, Download, ImagePlus, Loader2, Plus, Trash2, X } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageLoader, ErrorState, EmptyState } from '@/components/PageStates';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { supabase } from '@/integrations/supabase/client';
import { cbtApi, cbtImageUrl, toCsv } from '@/lib/cbt';
import { examPhase } from './CbtAdminPage';
import { toast } from 'sonner';

const L = 'ABCDE';
const toLocal = (iso: string | null) => { if (!iso) return ''; const d = new Date(iso); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); };
const fromLocal = (v: string) => (v ? new Date(v).toISOString() : null);

type Q = { id: string; position: number; section_id: string | null; text: string; image_url: string | null; options: string[]; multi: boolean; marks: number | null; negative: number | null; correct: number[]; explanation: string; dirty?: boolean };

function problemsOf(q: Q): string[] {
  const p: string[] = [];
  if (!q.text.trim() && !q.image_url) p.push('no question text');
  if (q.options.some(o => !o.trim())) p.push('empty option');
  if (!q.correct.length) p.push('no correct answer');
  if (!q.multi && q.correct.length > 1) p.push('single-answer question has several answers');
  return p;
}

function AdminImg({ path }: { path: string }) {
  const [u, setU] = useState<string | null>(null);
  useEffect(() => { cbtImageUrl(path).then(setU); }, [path]);
  return u ? <img src={u} alt="Question figure" className="max-h-40 rounded border" /> : null;
}

export default function CbtAdminExamPage() {
  const { id = '' } = useParams();
  const { isAdmin, loading } = useIsAdmin();
  const [exam, setExam] = useState<any>(null);
  const [qs, setQs] = useState<Q[]>([]);
  const [sections, setSections] = useState<{ id: string; name: string; position: number }[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState('settings');
  const [classesText, setClassesText] = useState('');
  const [newSection, setNewSection] = useState('');
  const [report, setReport] = useState<any>(null);
  const [preview, setPreview] = useState(false);

  const load = useCallback(async () => {
    setErr(null);
    const [e, q, k, s] = await Promise.all([
      supabase.from('cbt_exams').select('*').eq('id', id).maybeSingle(),
      supabase.from('cbt_questions').select('*').eq('exam_id', id).order('position'),
      supabase.from('cbt_answer_keys').select('*').eq('exam_id', id),
      supabase.from('cbt_sections').select('*').eq('exam_id', id).order('position'),
    ]);
    const firstErr = e.error || q.error || k.error || s.error;
    if (firstErr) return setErr(firstErr.message);
    if (!e.data) return setErr('Exam not found');
    setExam(e.data); setClassesText((e.data.eligible_classes || []).join(', '));
    const keys = new Map((k.data || []).map((x: any) => [x.question_id, x]));
    setQs((q.data || []).map((x: any) => ({ ...x, options: x.options as string[], correct: keys.get(x.id)?.correct ?? [], explanation: keys.get(x.id)?.explanation ?? '' })));
    setSections(s.data || []);
  }, [id]);
  useEffect(() => { if (isAdmin) load(); }, [isAdmin, load]);

  const loadReport = useCallback(async () => {
    try { setReport(await cbtApi.adminReport(id)); } catch (e: any) { toast.error(e.message); }
  }, [id]);
  useEffect(() => { if (tab === 'report' && isAdmin) loadReport(); }, [tab, isAdmin, loadReport]);

  const locked = exam && exam.status !== 'draft';
  const problems = useMemo(() => qs.map((q, i) => ({ i, p: problemsOf(q) })).filter(x => x.p.length), [qs]);
  const maxMarks = useMemo(() => qs.reduce((s, q) => s + Number(q.marks ?? exam?.marks_correct ?? 0), 0), [qs, exam]);

  if (loading) return <PageLoader />;
  if (!isAdmin) return <Navigate to="/app" replace />;
  if (err) return <div className="p-6"><ErrorState message={err} onRetry={load} /></div>;
  if (!exam) return <PageLoader />;

  const set = (patch: any) => setExam((e: any) => ({ ...e, ...patch }));
  const saveSettings = async () => {
    setBusy(true);
    const { id: _id, created_at, updated_at, published_at, created_by, status, results_released, ...rest } = exam;
    const eligible_classes = classesText.split(',').map(s => s.trim()).filter(Boolean);
    const { error } = await supabase.from('cbt_exams').update({ ...rest, eligible_classes }).eq('id', id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success('Settings saved'); load();
  };
  const action = async (fn: () => Promise<any>, ok: string) => {
    setBusy(true);
    try { const r = await fn(); if (r?.error) throw r.error; toast.success(ok); await load(); }
    catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  };
  const publish = async () => {
    if (qs.some(q => q.dirty)) return toast.error('Save all questions first');
    await saveSettings();
    await action(() => cbtApi.publish(id), 'Exam published');
  };

  const addQuestion = async () => {
    const position = (qs[qs.length - 1]?.position ?? 0) + 1;
    const { data, error } = await supabase.from('cbt_questions').insert({ exam_id: id, position, options: ['', '', '', ''], section_id: sections[sections.length - 1]?.id ?? null }).select('*').single();
    if (error) return toast.error(error.message);
    setQs(list => [...list, { ...(data as any), options: data.options as string[], correct: [], explanation: '' }]);
  };
  const patchQ = (qid: string, patch: Partial<Q>) => setQs(list => list.map(q => q.id === qid ? { ...q, ...patch, dirty: true } : q));
  const saveQ = async (q: Q) => {
    const { error } = await supabase.from('cbt_questions').update({ text: q.text, options: q.options, multi: q.multi, marks: q.marks, negative: q.negative, section_id: q.section_id, image_url: q.image_url }).eq('id', q.id);
    if (error) return toast.error(error.message);
    const valid = q.correct.filter(c => c < q.options.length);
    const { error: e2 } = await supabase.from('cbt_answer_keys').upsert({ question_id: q.id, exam_id: id, correct: valid, explanation: q.explanation || null });
    if (e2) return toast.error(e2.message);
    setQs(list => list.map(x => x.id === q.id ? { ...x, correct: valid, dirty: false } : x));
    toast.success('Question saved');
  };
  const delQ = async (q: Q) => {
    if (!confirm('Delete this question?')) return;
    const { error } = await supabase.from('cbt_questions').delete().eq('id', q.id);
    if (error) return toast.error(error.message);
    setQs(list => list.filter(x => x.id !== q.id));
  };
  const move = async (i: number, dir: -1 | 1) => {
    const a = qs[i], b = qs[i + dir]; if (!a || !b) return;
    const r1 = await supabase.from('cbt_questions').update({ position: b.position }).eq('id', a.id);
    const r2 = await supabase.from('cbt_questions').update({ position: a.position }).eq('id', b.id);
    if (r1.error || r2.error) return toast.error((r1.error || r2.error)!.message);
    const next = [...qs]; next[i] = { ...b, position: a.position }; next[i + dir] = { ...a, position: b.position }; setQs(next);
  };
  const uploadImg = async (q: Q, file: File) => {
    if (!/^image\/(png|jpe?g|webp|gif)$/.test(file.type)) return toast.error('Use a PNG, JPG, WEBP or GIF image');
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be under 5 MB');
    const path = `${id}/${q.id}-${Date.now()}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage.from('cbt-images').upload(path, file, { contentType: file.type });
    if (error) return toast.error(error.message);
    patchQ(q.id, { image_url: path });
  };
  const addSection = async () => {
    if (!newSection.trim()) return;
    const { data, error } = await supabase.from('cbt_sections').insert({ exam_id: id, name: newSection.trim(), position: sections.length }).select('*').single();
    if (error) return toast.error(error.message);
    setSections(s => [...s, data]); setNewSection('');
  };

  const exportCsv = () => {
    if (!report?.results?.length) return toast.error('No results to export');
    const csv = toCsv(report.results.map((r: any, i: number) => ({ rank: i + 1, name: r.name, class: r.class ?? '', attempt: r.attempt_no, status: r.status, submitted_at: r.submitted_at, score: r.score, max_marks: r.max_marks, percentage: r.percentage, accuracy: r.accuracy, correct: r.correct, wrong: r.wrong, unanswered: r.unanswered })));
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a'); a.href = url; a.download = `${exam.title.replace(/\W+/g, '_')}_results.csv`; a.click(); URL.revokeObjectURL(url);
  };

  const phase = examPhase(exam);
  const scores: number[] = report?.results?.map((r: any) => Number(r.percentage)) ?? [];
  const buckets = Array.from({ length: 10 }, (_, b) => scores.filter(s => (b === 9 ? s >= 90 : s >= b * 10 && s < b * 10 + 10) || (b === 0 && s < 0)).length);
  const avg = scores.length ? (report.results.reduce((s: number, r: any) => s + Number(r.score), 0) / scores.length).toFixed(2) : '—';

  return (
    <div className="min-h-dvh bg-background">
      <SEO title="Edit CBT Exam | Admin" description="Edit CBT exam" noindex />
      <AppHeader />
      <main className="container py-6 space-y-4 max-w-4xl">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground"><Link to="/admin/cbt" className="underline">CBT Exams</Link> › Edit</p>
            <h1 className="text-2xl font-bold font-display">{exam.title || 'Untitled exam'}</h1>
            <div className="flex gap-2 mt-1"><Badge className="capitalize">{phase}</Badge><Badge variant="outline">{qs.length} questions · {maxMarks} marks</Badge></div>
          </div>
          <div className="flex flex-wrap gap-2">
            {exam.status === 'draft' && <Button onClick={publish} disabled={busy}>Publish</Button>}
            {exam.status === 'published' && <Button variant="outline" disabled={busy} onClick={() => action(async () => { const { data, error } = await (supabase.rpc as any)('cbt_generate_cards', { _exam: id }); if (error) throw error; toast.success(`${data} admit cards issued`); }, 'Admit cards ready')}>Generate admit cards</Button>}
            {exam.status === 'published' && <Button variant="outline" disabled={busy} onClick={() => action(() => supabase.from('cbt_exams').update({ status: 'draft' }).eq('id', id) as any, 'Moved back to draft')}>Unpublish</Button>}
            {exam.status === 'published' && !exam.results_released && exam.result_policy !== 'immediate' && <Button variant="secondary" disabled={busy} onClick={() => action(() => supabase.from('cbt_exams').update({ results_released: true }).eq('id', id) as any, 'Results released')}>Release results</Button>}
            {exam.status !== 'cancelled' && <Button variant="destructive" disabled={busy} onClick={() => confirm('Cancel this exam? Students will no longer be able to start it.') && action(() => supabase.from('cbt_exams').update({ status: 'cancelled' }).eq('id', id) as any, 'Exam cancelled')}>Cancel exam</Button>}
            {exam.status === 'cancelled' && <Button variant="outline" disabled={busy} onClick={() => action(() => supabase.from('cbt_exams').update({ status: 'draft' }).eq('id', id) as any, 'Moved to draft')}>Restore as draft</Button>}
          </div>
        </div>
        {locked && <p className="text-sm rounded-md border bg-muted/50 p-3">This exam is {exam.status}. Questions, timing and marking are locked. Unpublish it (only possible before any student starts) to edit them.</p>}

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList><TabsTrigger value="settings">Settings</TabsTrigger><TabsTrigger value="questions">Questions ({qs.length})</TabsTrigger><TabsTrigger value="report">Results & Report</TabsTrigger></TabsList>

          <TabsContent value="settings">
            <Card><CardContent className="p-4 grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1"><Label htmlFor="t">Title</Label><Input id="t" value={exam.title} onChange={e => set({ title: e.target.value })} /></div>
              <div className="space-y-1"><Label htmlFor="s">Subject</Label><Input id="s" value={exam.subject ?? ''} onChange={e => set({ subject: e.target.value })} /></div>
              <div className="space-y-1"><Label htmlFor="d">Duration (minutes)</Label><Input id="d" type="number" min={1} disabled={locked} value={exam.duration_minutes} onChange={e => set({ duration_minutes: Number(e.target.value) })} /></div>
              <div className="sm:col-span-2 space-y-1"><Label htmlFor="desc">Description</Label><Textarea id="desc" value={exam.description ?? ''} onChange={e => set({ description: e.target.value })} /></div>
              <div className="sm:col-span-2 space-y-1"><Label htmlFor="ins">Instructions</Label><Textarea id="ins" rows={5} value={exam.instructions ?? ''} onChange={e => set({ instructions: e.target.value })} /></div>
              <div className="space-y-1"><Label htmlFor="st">Start</Label><Input id="st" type="datetime-local" disabled={locked} value={toLocal(exam.starts_at)} onChange={e => set({ starts_at: fromLocal(e.target.value) })} /></div>
              <div className="space-y-1"><Label htmlFor="en">End</Label><Input id="en" type="datetime-local" value={toLocal(exam.ends_at)} onChange={e => set({ ends_at: fromLocal(e.target.value) })} /></div>
              <div className="space-y-1"><Label htmlFor="mc">Marks per correct</Label><Input id="mc" type="number" step="0.25" disabled={locked} value={exam.marks_correct} onChange={e => set({ marks_correct: Number(e.target.value) })} /></div>
              <div className="space-y-1"><Label htmlFor="mw">Negative marks per wrong</Label><Input id="mw" type="number" step="0.25" min={0} disabled={locked} value={exam.marks_wrong} onChange={e => set({ marks_wrong: Number(e.target.value) })} /></div>
              <div className="space-y-1"><Label htmlFor="mu">Marks for unanswered</Label><Input id="mu" type="number" step="0.25" disabled={locked} value={exam.marks_unanswered} onChange={e => set({ marks_unanswered: Number(e.target.value) })} /></div>
              <div className="space-y-1"><Label htmlFor="ma">Attempts allowed</Label><Input id="ma" type="number" min={1} value={exam.max_attempts} onChange={e => set({ max_attempts: Number(e.target.value) })} /></div>
              <div className="space-y-1">
                <Label>Result release</Label>
                <Select value={exam.result_policy} onValueChange={v => set({ result_policy: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="immediate">Immediately after submission</SelectItem><SelectItem value="scheduled">At a set time</SelectItem><SelectItem value="manual">When I release them</SelectItem></SelectContent>
                </Select>
              </div>
              {exam.result_policy === 'scheduled' && <div className="space-y-1"><Label htmlFor="rr">Release at</Label><Input id="rr" type="datetime-local" value={toLocal(exam.result_release_at)} onChange={e => set({ result_release_at: fromLocal(e.target.value) })} /></div>}
              <div className="sm:col-span-2 space-y-1"><Label htmlFor="cl">Eligible classes (comma separated, empty = everyone)</Label><Input id="cl" disabled={locked} placeholder="e.g. 11, 12, Dropper" value={classesText} onChange={e => setClassesText(e.target.value)} /></div>
              {[['allow_revisit', 'Students can go back to previous questions', locked], ['show_answers', 'Show correct answers in results', false], ['show_explanations', 'Show explanations in results', false]].map(([k, label, dis]) => (
                <label key={k as string} className="flex items-center justify-between gap-3 rounded-md border p-3 sm:col-span-2"><span className="text-sm">{label as string}</span><Switch checked={exam[k as string]} disabled={!!dis} onCheckedChange={v => set({ [k as string]: v })} /></label>
              ))}
              <div className="sm:col-span-2"><Button onClick={saveSettings} disabled={busy}>{busy && <Loader2 className="w-4 h-4 animate-spin" />}Save settings</Button></div>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="questions" className="space-y-3">
            {problems.length > 0 && <div className="rounded-md border border-destructive/50 bg-destructive/5 p-3 text-sm"><b>Answer key check:</b> {problems.map(x => `Q${x.i + 1}: ${x.p.join(', ')}`).join(' · ')}</div>}
            {qs.length > 0 && problems.length === 0 && <p className="text-sm text-success">Answer key check passed for all {qs.length} questions.</p>}
            <div className="flex flex-wrap gap-2 items-center">
              <Button variant="outline" size="sm" onClick={() => setPreview(p => !p)}>{preview ? 'Back to editing' : 'Preview paper'}</Button>
              {!locked && <><Input className="w-48 h-9" placeholder="New section (e.g. Physics)" value={newSection} onChange={e => setNewSection(e.target.value)} /><Button size="sm" variant="outline" onClick={addSection}>Add section</Button></>}
            </div>
            {qs.length === 0 && <EmptyState title="No questions yet" hint="Add your first question." />}
            {qs.map((q, i) => preview ? (
              <Card key={q.id}><CardContent className="p-4 space-y-2">
                <p className="text-xs text-muted-foreground">{sections.find(s => s.id === q.section_id)?.name}</p>
                <p className="font-medium whitespace-pre-wrap">{i + 1}. {q.text}</p>
                {q.image_url && <AdminImg path={q.image_url} />}
                <ul className="text-sm space-y-1">{q.options.map((o, j) => <li key={j} className={q.correct.includes(j) ? 'text-success font-semibold' : ''}>{L[j]}. {o}</li>)}</ul>
              </CardContent></Card>
            ) : (
              <Card key={q.id} className={q.dirty ? 'border-primary' : ''}>
                <CardHeader className="p-4 pb-2 flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base">Question {i + 1}</CardTitle>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" aria-label="Move up" disabled={locked || i === 0} onClick={() => move(i, -1)}><ArrowUp className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" aria-label="Move down" disabled={locked || i === qs.length - 1} onClick={() => move(i, 1)}><ArrowDown className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" aria-label="Delete question" disabled={locked} onClick={() => delQ(q)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  <fieldset disabled={locked} className="space-y-3">
                    <Textarea aria-label="Question text" placeholder="Question text" value={q.text} onChange={e => patchQ(q.id, { text: e.target.value })} />
                    <div className="flex items-center gap-2 flex-wrap">
                      {q.image_url && <><AdminImg path={q.image_url} /><Button size="sm" variant="ghost" onClick={() => patchQ(q.id, { image_url: null })}><X className="w-4 h-4" />Remove image</Button></>}
                      <label className="inline-flex items-center gap-1 text-sm cursor-pointer border rounded-md px-2 py-1"><ImagePlus className="w-4 h-4" />Image<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="sr-only" onChange={e => e.target.files?.[0] && uploadImg(q, e.target.files[0])} /></label>
                    </div>
                    <div className="space-y-2">
                      {q.options.map((o, j) => (
                        <div key={j} className="flex items-center gap-2">
                          <button type="button" aria-label={`Mark option ${L[j]} correct`} aria-pressed={q.correct.includes(j)}
                            onClick={() => patchQ(q.id, { correct: q.multi ? (q.correct.includes(j) ? q.correct.filter(c => c !== j) : [...q.correct, j]) : [j] })}
                            className={`w-8 h-8 shrink-0 rounded-full border font-mono text-sm ${q.correct.includes(j) ? 'bg-success text-success-foreground border-success' : ''}`}>{L[j]}</button>
                          <Input aria-label={`Option ${L[j]}`} value={o} onChange={e => patchQ(q.id, { options: q.options.map((x, k) => k === j ? e.target.value : x) })} />
                        </div>
                      ))}
                      <div className="flex gap-2 text-sm">
                        <Button type="button" size="sm" variant="outline" onClick={() => patchQ(q.id, { options: q.options.length === 4 ? [...q.options, ''] : q.options.slice(0, 4), correct: q.correct.filter(c => c < 4 || q.options.length === 4) })}>{q.options.length === 4 ? '5 options' : '4 options'}</Button>
                        <label className="flex items-center gap-2"><Switch checked={q.multi} onCheckedChange={v => patchQ(q.id, { multi: v, correct: v ? q.correct : q.correct.slice(0, 1) })} />Multiple correct</label>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1"><Label className="text-xs">Marks (blank = exam default)</Label><Input type="number" step="0.25" value={q.marks ?? ''} onChange={e => patchQ(q.id, { marks: e.target.value === '' ? null : Number(e.target.value) })} /></div>
                      <div className="space-y-1"><Label className="text-xs">Negative (blank = default)</Label><Input type="number" step="0.25" min={0} value={q.negative ?? ''} onChange={e => patchQ(q.id, { negative: e.target.value === '' ? null : Number(e.target.value) })} /></div>
                      <div className="space-y-1"><Label className="text-xs">Section</Label>
                        <Select value={q.section_id ?? 'none'} onValueChange={v => patchQ(q.id, { section_id: v === 'none' ? null : v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="none">None</SelectItem>{sections.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Textarea aria-label="Explanation" placeholder="Solution / explanation (optional)" value={q.explanation} onChange={e => patchQ(q.id, { explanation: e.target.value })} />
                  </fieldset>
                  {!locked && <Button size="sm" onClick={() => saveQ(q)} disabled={!q.dirty}>{q.dirty ? 'Save question' : 'Saved'}</Button>}
                </CardContent>
              </Card>
            ))}
            {!locked && !preview && <Button onClick={addQuestion} variant="outline" className="w-full"><Plus className="w-4 h-4" />Add question</Button>}
          </TabsContent>

          <TabsContent value="report" className="space-y-4">
            {!report ? <PageLoader /> : (<>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[['Eligible students', report.eligible], ['Started', report.started_students], ['Not started', Math.max(0, report.eligible - report.started_students)], ['In progress', report.in_progress], ['Submitted', report.submitted], ['Average score', avg],
                  ['Highest', report.results.length ? Number(report.results[0].score) : '—'], ['Lowest', report.results.length ? Number(report.results[report.results.length - 1].score) : '—']].map(([k, v]) => (
                  <Card key={k as string}><CardContent className="p-3"><p className="font-mono text-xl font-bold">{v}</p><p className="text-xs text-muted-foreground">{k}</p></CardContent></Card>
                ))}
              </div>
              <Card><CardHeader className="p-4 pb-2"><CardTitle className="text-base">Score distribution (%)</CardTitle></CardHeader><CardContent className="p-4 pt-0">
                <div className="flex items-end gap-1 h-32" role="img" aria-label="Score distribution chart">
                  {buckets.map((n, b) => <div key={b} className="flex-1 flex flex-col items-center gap-1"><span className="text-xs font-mono">{n || ''}</span><div className="w-full bg-primary rounded-t" style={{ height: `${scores.length ? (n / Math.max(...buckets)) * 100 : 0}%`, minHeight: n ? 4 : 0 }} /><span className="text-[10px] text-muted-foreground">{b * 10}</span></div>)}
                </div>
              </CardContent></Card>
              <Card><CardHeader className="p-4 pb-2 flex-row items-center justify-between space-y-0"><CardTitle className="text-base">Student results</CardTitle><Button size="sm" variant="outline" onClick={exportCsv}><Download className="w-4 h-4" />CSV</Button></CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  {report.results.length === 0 ? <p className="p-4 text-sm text-muted-foreground">No submissions yet.</p> : (
                    <table className="w-full text-sm"><thead className="bg-muted/50 text-left"><tr>{['#', 'Student', 'Class', 'Score', '%', 'C/W/U', ''].map(h => <th key={h} className="p-2">{h}</th>)}</tr></thead>
                      <tbody>{report.results.map((r: any, i: number) => (
                        <tr key={r.attempt_id} className="border-t"><td className="p-2 font-mono">{i + 1}</td><td className="p-2">{r.name}{r.attempt_no > 1 && <span className="text-xs text-muted-foreground"> (try {r.attempt_no})</span>}</td><td className="p-2">{r.class ?? '—'}</td><td className="p-2 font-mono">{Number(r.score)}/{Number(r.max_marks)}</td><td className="p-2 font-mono">{Number(r.percentage)}</td><td className="p-2 font-mono">{r.correct}/{r.wrong}/{r.unanswered}</td><td className="p-2"><Link className="underline" to={`/cbt/result/${r.attempt_id}`}>View</Link></td></tr>
                      ))}</tbody></table>
                  )}
                </CardContent></Card>
              <Card><CardHeader className="p-4 pb-2"><CardTitle className="text-base">Question-wise analysis</CardTitle></CardHeader><CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm"><thead className="bg-muted/50 text-left"><tr>{['Q', 'Question', 'Correct', 'Wrong', 'Blank'].map(h => <th key={h} className="p-2">{h}</th>)}</tr></thead>
                  <tbody>{report.questions.map((q: any, i: number) => <tr key={q.id} className="border-t"><td className="p-2 font-mono">{i + 1}</td><td className="p-2 max-w-xs truncate">{q.text}</td><td className="p-2 font-mono text-success">{q.correct}</td><td className="p-2 font-mono text-destructive">{q.wrong}</td><td className="p-2 font-mono">{q.unanswered}</td></tr>)}</tbody></table>
              </CardContent></Card>
            </>)}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
