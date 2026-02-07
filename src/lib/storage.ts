import { OMRSheet, ExamAttempt, ExamResult, ScoreboardEntry } from '@/types/exam';

const SHEETS_KEY = 'exam_master_sheets';
const ATTEMPTS_KEY = 'exam_master_attempts';
const RESULTS_KEY = 'exam_master_results';
const SCOREBOARD_KEY = 'exam_master_scoreboard';

// OMR Sheets
export function saveSheet(sheet: OMRSheet): void {
  const sheets = getSheets();
  const existingIndex = sheets.findIndex(s => s.id === sheet.id);
  if (existingIndex >= 0) {
    sheets[existingIndex] = sheet;
  } else {
    sheets.push(sheet);
  }
  localStorage.setItem(SHEETS_KEY, JSON.stringify(sheets));
}

export function getSheets(): OMRSheet[] {
  const data = localStorage.getItem(SHEETS_KEY);
  if (!data) return [];
  return JSON.parse(data).map((s: OMRSheet) => ({
    ...s,
    createdAt: new Date(s.createdAt),
  }));
}

export function getSheet(id: string): OMRSheet | null {
  const sheets = getSheets();
  return sheets.find(s => s.id === id) || null;
}

export function deleteSheet(id: string): void {
  const sheets = getSheets().filter(s => s.id !== id);
  localStorage.setItem(SHEETS_KEY, JSON.stringify(sheets));
}

// Exam Attempts
export function saveAttempt(attempt: ExamAttempt): void {
  const attempts = getAttempts();
  const existingIndex = attempts.findIndex(a => a.id === attempt.id);
  if (existingIndex >= 0) {
    attempts[existingIndex] = attempt;
  } else {
    attempts.push(attempt);
  }
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
}

export function getAttempts(): ExamAttempt[] {
  const data = localStorage.getItem(ATTEMPTS_KEY);
  if (!data) return [];
  return JSON.parse(data).map((a: ExamAttempt) => ({
    ...a,
    startTime: new Date(a.startTime),
    endTime: a.endTime ? new Date(a.endTime) : null,
  }));
}

export function getAttempt(id: string): ExamAttempt | null {
  const attempts = getAttempts();
  return attempts.find(a => a.id === id) || null;
}

export function getInProgressAttempt(sheetId: string): ExamAttempt | null {
  const attempts = getAttempts();
  return attempts.find(a => a.sheetId === sheetId && a.status === 'in-progress') || null;
}

export function deleteAttempt(id: string): void {
  const attempts = getAttempts().filter(a => a.id !== id);
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
}

// Exam Results
export function saveResult(result: ExamResult): void {
  const results = getResults();
  results.unshift(result); // Add to beginning
  localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
  
  // Also add to scoreboard
  addToScoreboard({
    id: result.attemptId,
    sheetTitle: result.sheetTitle,
    score: result.score,
    maxScore: result.maxScore,
    accuracy: result.accuracy,
    timeSpent: result.timeSpent,
    completedAt: result.completedAt,
  });
}

export function getResults(): ExamResult[] {
  const data = localStorage.getItem(RESULTS_KEY);
  if (!data) return [];
  return JSON.parse(data).map((r: ExamResult) => ({
    ...r,
    completedAt: new Date(r.completedAt),
  }));
}

export function getResult(attemptId: string): ExamResult | null {
  const results = getResults();
  return results.find(r => r.attemptId === attemptId) || null;
}

export function deleteResult(attemptId: string): void {
  const results = getResults().filter(r => r.attemptId !== attemptId);
  localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
}

// Scoreboard
export function addToScoreboard(entry: ScoreboardEntry): void {
  const scoreboard = getScoreboard();
  scoreboard.unshift(entry);
  // Keep only last 10 entries
  const trimmed = scoreboard.slice(0, 10);
  localStorage.setItem(SCOREBOARD_KEY, JSON.stringify(trimmed));
}

export function getScoreboard(): ScoreboardEntry[] {
  const data = localStorage.getItem(SCOREBOARD_KEY);
  if (!data) return [];
  return JSON.parse(data).map((e: ScoreboardEntry) => ({
    ...e,
    completedAt: new Date(e.completedAt),
  }));
}

export function clearScoreboard(): void {
  localStorage.setItem(SCOREBOARD_KEY, JSON.stringify([]));
}

// Generate unique ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
