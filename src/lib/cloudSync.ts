import { supabase } from '@/integrations/supabase/client';
import type { OMRSheet, ExamAttempt, ExamResult } from '@/types/exam';

// Personal OMR sheets, attempts and results are cached in localStorage and
// backed up to the signed-in user's account so they survive logout/re-login
// and work across devices.

const KEYS = {
  sheets: 'exam_master_sheets',
  attempts: 'exam_master_attempts',
  results: 'exam_master_results',
};
export const SYNC_EVENT = 'exam-data-synced';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const read = (k: string): any[] => { try { return JSON.parse(localStorage.getItem(k) || '[]'); } catch { return []; } };
const write = (k: string, v: any[]) => localStorage.setItem(k, JSON.stringify(v));

async function uid(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

const sheetRow = (s: OMRSheet, user_id: string) => ({
  id: s.id, user_id, title: s.title, subject: s.subject, total_questions: s.totalQuestions,
  options_per_question: s.optionsPerQuestion, time_limit: s.timeLimit, negative_marking: s.negativeMarking,
  marks_per_question: s.marksPerQuestion, answer_key: s.answerKey as any, created_at: new Date(s.createdAt).toISOString(),
});
const attemptRow = (a: ExamAttempt, user_id: string) => ({
  id: a.id, user_id, sheet_id: a.sheetId, sheet_title: a.sheetTitle, answers: a.answers as any,
  marked_for_review: a.markedForReview as any, start_time: new Date(a.startTime).toISOString(),
  end_time: a.endTime ? new Date(a.endTime).toISOString() : null, time_spent: a.timeSpent, score: a.score,
  correct: a.correct, wrong: a.wrong, unattempted: a.unattempted, accuracy: a.accuracy, status: a.status,
});
const resultRow = (r: ExamResult, user_id: string) => ({
  id: r.attemptId, user_id, attempt_id: r.attemptId, sheet_id: r.sheetId, sheet_title: r.sheetTitle,
  total_questions: r.totalQuestions, score: r.score, max_score: r.maxScore, correct: r.correct, wrong: r.wrong,
  unattempted: r.unattempted, accuracy: r.accuracy, time_spent: r.timeSpent,
  completed_at: new Date(r.completedAt).toISOString(), question_results: r.questionResults as any,
});

export async function pushSheet(s: OMRSheet) {
  const u = await uid(); if (!u || !UUID.test(s.id)) return;
  await supabase.from('sheets').upsert(sheetRow(s, u));
}
export async function pushAttempt(a: ExamAttempt) {
  const u = await uid(); if (!u || !UUID.test(a.id) || !UUID.test(a.sheetId)) return;
  const sheet = read(KEYS.sheets).find((s) => s.id === a.sheetId);
  if (sheet) await supabase.from('sheets').upsert(sheetRow(sheet, u));
  await supabase.from('attempts').upsert(attemptRow(a, u));
}
export async function pushResult(r: ExamResult) {
  const u = await uid(); if (!u || !UUID.test(r.attemptId)) return;
  const att = read(KEYS.attempts).find((a) => a.id === r.attemptId);
  if (att) await pushAttempt(att);
  const { error } = await supabase.from('results').upsert(resultRow(r, u));
  // The server derives leaderboard XP from the saved result, never browser-supplied XP.
  if (!error) await supabase.rpc('refresh_gamification');
}
export async function removeRemote(table: 'sheets' | 'results', id: string) {
  const u = await uid(); if (!u || !UUID.test(id)) return;
  if (table === 'sheets') {
    await supabase.from('results').delete().eq('sheet_id', id);
    await supabase.from('attempts').delete().eq('sheet_id', id);
    await supabase.from('sheets').delete().eq('id', id);
  } else {
    await supabase.from('results').delete().eq('attempt_id', id);
  }
}

/** Give legacy non-UUID local ids real UUIDs so they can be stored online. */
function migrateIds() {
  const map = new Map<string, string>();
  const fix = (id: string) => {
    if (UUID.test(id)) return id;
    if (!map.has(id)) map.set(id, crypto.randomUUID());
    return map.get(id)!;
  };
  const sheets = read(KEYS.sheets).map((s) => ({ ...s, id: fix(s.id) }));
  const attempts = read(KEYS.attempts).map((a) => ({ ...a, id: fix(a.id), sheetId: fix(a.sheetId) }));
  const results = read(KEYS.results).map((r) => ({ ...r, attemptId: fix(r.attemptId), sheetId: fix(r.sheetId) }));
  if (map.size) { write(KEYS.sheets, sheets); write(KEYS.attempts, attempts); write(KEYS.results, results); }
}

let running: Promise<void> | null = null;
export function syncAll(): Promise<void> {
  if (!running) running = doSync().catch((e) => console.warn('Sync failed', e)).finally(() => { running = null; });
  return running;
}

async function doSync() {
  const u = await uid(); if (!u) return;
  migrateIds();
  const [rs, ra, rr] = await Promise.all([
    supabase.from('sheets').select('*').eq('user_id', u),
    supabase.from('attempts').select('*').eq('user_id', u),
    supabase.from('results').select('*').eq('user_id', u),
  ]);
  if (rs.error || ra.error || rr.error) throw rs.error || ra.error || rr.error;
  const remoteS = new Set(rs.data!.map((x) => x.id));
  const remoteA = new Set(ra.data!.map((x) => x.id));
  const remoteR = new Set(rr.data!.map((x) => x.attempt_id));

  // Upload anything only on this device
  const ls: OMRSheet[] = read(KEYS.sheets), la: ExamAttempt[] = read(KEYS.attempts), lr: ExamResult[] = read(KEYS.results);
  const sheetIds = new Set([...remoteS, ...ls.map((s) => s.id)]);
  const newS = ls.filter((s) => !remoteS.has(s.id)).map((s) => sheetRow(s, u));
  if (newS.length) await supabase.from('sheets').upsert(newS);
  const newA = la.filter((a) => !remoteA.has(a.id) && sheetIds.has(a.sheetId)).map((a) => attemptRow(a, u));
  if (newA.length) await supabase.from('attempts').upsert(newA);
  const attIds = new Set([...remoteA, ...newA.map((a) => a.id)]);
  const newR = lr.filter((r) => !remoteR.has(r.attemptId) && attIds.has(r.attemptId) && sheetIds.has(r.sheetId)).map((r) => resultRow(r, u));
  if (newR.length) await supabase.from('results').upsert(newR);

  // Merge account data into this device
  const localS = new Set(ls.map((s) => s.id)), localA = new Set(la.map((a) => a.id)), localR = new Set(lr.map((r) => r.attemptId));
  const addS = rs.data!.filter((x) => !localS.has(x.id)).map((x) => ({
    id: x.id, title: x.title, subject: x.subject, totalQuestions: x.total_questions, optionsPerQuestion: x.options_per_question,
    timeLimit: x.time_limit, negativeMarking: Number(x.negative_marking), marksPerQuestion: Number(x.marks_per_question),
    answerKey: x.answer_key, createdAt: x.created_at,
  }));
  const addA = ra.data!.filter((x) => !localA.has(x.id)).map((x) => ({
    id: x.id, sheetId: x.sheet_id, sheetTitle: x.sheet_title, answers: x.answers, markedForReview: x.marked_for_review,
    startTime: x.start_time, endTime: x.end_time, timeSpent: x.time_spent, score: x.score == null ? null : Number(x.score),
    correct: x.correct, wrong: x.wrong, unattempted: x.unattempted, accuracy: Number(x.accuracy), status: x.status,
  }));
  const addR = rr.data!.filter((x) => !localR.has(x.attempt_id)).map((x) => ({
    attemptId: x.attempt_id, sheetId: x.sheet_id, sheetTitle: x.sheet_title, totalQuestions: x.total_questions,
    score: Number(x.score), maxScore: Number(x.max_score), correct: x.correct, wrong: x.wrong, unattempted: x.unattempted,
    accuracy: Number(x.accuracy), timeSpent: x.time_spent, completedAt: x.completed_at, questionResults: x.question_results,
  }));
  if (addS.length || addA.length || addR.length) {
    write(KEYS.sheets, [...ls, ...addS]);
    write(KEYS.attempts, [...la, ...addA]);
    const allR = [...lr, ...addR].sort((a: any, b: any) => +new Date(b.completedAt) - +new Date(a.completedAt));
    write(KEYS.results, allR);
    window.dispatchEvent(new Event(SYNC_EVENT));
  }
}

import { useEffect, useState } from 'react';
/** Re-render when account data finishes merging into this device. */
export function useSyncVersion() {
  const [v, setV] = useState(0);
  useEffect(() => {
    const h = () => setV((x) => x + 1);
    window.addEventListener(SYNC_EVENT, h);
    return () => window.removeEventListener(SYNC_EVENT, h);
  }, []);
  return v;
}
