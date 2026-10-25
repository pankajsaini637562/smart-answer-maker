import { supabase } from '@/integrations/supabase/client';

// ---------- Types ----------
export interface CbtExamCard {
  id: string; title: string; description: string | null; subject: string | null; instructions: string | null;
  duration_minutes: number; starts_at: string; ends_at: string; max_attempts: number;
  marks_correct: number; marks_wrong: number; marks_unanswered: number; allow_revisit: boolean;
  result_policy: 'immediate' | 'scheduled' | 'manual'; result_release_at: string | null; results_released: boolean;
  question_count: number; attempts_used: number; active_attempt_id: string | null; last_attempt_id: string | null;
}
export interface CbtQuestion {
  id: string; position: number; section: string | null; text: string; image_url: string | null;
  options: string[]; multi: boolean; marks: number; negative: number;
}
export interface CbtPaper {
  status: string; attempt_id: string; exam_id: string; title: string; started_at: string; deadline: string;
  server_now: string; allow_revisit: boolean; questions: CbtQuestion[];
  responses: { question_id: string; selected: number[]; marked: boolean }[];
}

// ---------- Pure logic (mirrors server scoring in cbt_finalize) ----------
export type QStatus = 'correct' | 'wrong' | 'partial' | 'unanswered';
export interface ScoreRules { marksCorrect: number; marksWrong: number; marksUnanswered: number }
export interface ScoreQuestion { correct: number[]; selected: number[]; multi: boolean; marks?: number | null; negative?: number | null }

const norm = (a: number[]) => [...new Set(a)].sort((x, y) => x - y);

export function scoreQuestion(q: ScoreQuestion, r: ScoreRules): { status: QStatus; marks: number } {
  const sel = norm(q.selected); const key = norm(q.correct);
  const mc = q.marks ?? r.marksCorrect; const mw = q.negative ?? r.marksWrong;
  if (sel.length === 0) return { status: 'unanswered', marks: r.marksUnanswered };
  if (sel.length === key.length && sel.every((v, i) => v === key[i])) return { status: 'correct', marks: mc };
  if (q.multi && sel.every(v => key.includes(v))) return { status: 'partial', marks: 0 };
  return { status: 'wrong', marks: -mw };
}

export function scoreAttempt(qs: ScoreQuestion[], r: ScoreRules) {
  let correct = 0, wrong = 0, unanswered = 0, score = 0, max = 0, pos = 0, neg = 0;
  for (const q of qs) {
    const s = scoreQuestion(q, r);
    max += q.marks ?? r.marksCorrect;
    score += s.marks;
    if (s.status === 'correct') { correct++; pos += s.marks; }
    else if (s.status === 'unanswered') unanswered++;
    else { wrong++; if (s.marks < 0) neg += -s.marks; }
  }
  const attempted = correct + wrong;
  return {
    total: qs.length, attempted, correct, wrong, unanswered, score, max, positive: pos, negative: neg,
    percentage: max > 0 ? Math.round((score * 100 / max) * 100) / 100 : 0,
    accuracy: attempted > 0 ? Math.round((correct * 100 / attempted) * 100) / 100 : 0,
  };
}

/** Seconds left, using server clock offset (serverNow - clientNow at fetch time). */
export function remainingSeconds(deadlineIso: string, clientNowMs: number, serverOffsetMs: number): number {
  return Math.max(0, Math.floor((new Date(deadlineIso).getTime() - (clientNowMs + serverOffsetMs)) / 1000));
}

export type CardCategory = 'upcoming' | 'available' | 'in_progress' | 'submitted' | 'released' | 'expired';
export function categorize(e: Pick<CbtExamCard, 'starts_at' | 'ends_at' | 'active_attempt_id' | 'last_attempt_id' | 'results_released' | 'attempts_used' | 'max_attempts'>, nowMs: number): CardCategory {
  if (e.active_attempt_id) return 'in_progress';
  const start = new Date(e.starts_at).getTime(); const end = new Date(e.ends_at).getTime();
  const canAttempt = e.attempts_used < e.max_attempts;
  if (nowMs < start) return 'upcoming';
  if (nowMs < end && canAttempt) return 'available';
  if (e.last_attempt_id) return e.results_released ? 'released' : 'submitted';
  return 'expired';
}

export function formatClock(sec: number) {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  const p = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${p(m)}:${p(s)}` : `${p(m)}:${p(s)}`;
}

// ---------- RPC wrappers ----------
const rpc = async <T,>(fn: string, args?: Record<string, unknown>): Promise<T> => {
  const { data, error } = await (supabase.rpc as any)(fn, args);
  if (error) throw new Error(error.message);
  return data as T;
};
export const cbtApi = {
  list: () => rpc<{ server_now: string; exams: CbtExamCard[] }>('cbt_list_exams'),
  start: (examId: string) => rpc<string>('cbt_start_attempt', { _exam: examId }),
  paper: (attemptId: string) => rpc<CbtPaper>('cbt_get_paper', { _attempt: attemptId }),
  save: (attemptId: string, questionId: string, selected: number[], marked: boolean) =>
    rpc<string>('cbt_save_response', { _attempt: attemptId, _question: questionId, _selected: selected, _marked: marked }),
  submit: (attemptId: string) => rpc<string>('cbt_submit', { _attempt: attemptId }),
  result: (attemptId: string) => rpc<any>('cbt_get_result', { _attempt: attemptId }),
  publish: (examId: string) => rpc<void>('cbt_publish', { _exam: examId }),
  adminStats: () => rpc<any>('cbt_admin_stats'),
  adminReport: (examId: string) => rpc<any>('cbt_admin_report', { _exam: examId }),
};

const urlCache = new Map<string, string>();
export async function cbtImageUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  if (urlCache.has(path)) return urlCache.get(path)!;
  const { data } = await supabase.storage.from('cbt-images').createSignedUrl(path, 3600);
  if (data?.signedUrl) urlCache.set(path, data.signedUrl);
  return data?.signedUrl ?? null;
}

export function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return '';
  const cols = Object.keys(rows[0]);
  const esc = (v: unknown) => { const s = v == null ? '' : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  return [cols.join(','), ...rows.map(r => cols.map(c => esc(r[c])).join(','))].join('\n');
}
