import { describe, it, expect } from 'vitest';
import { scoreQuestion, scoreAttempt, remainingSeconds, categorize } from './cbt';

const rules = { marksCorrect: 4, marksWrong: 1, marksUnanswered: 0 };

describe('CBT scoring', () => {
  it('single correct gives +4', () => expect(scoreQuestion({ correct: [2], selected: [2], multi: false }, rules)).toEqual({ status: 'correct', marks: 4 }));
  it('single wrong gives -1', () => expect(scoreQuestion({ correct: [2], selected: [1], multi: false }, rules)).toEqual({ status: 'wrong', marks: -1 }));
  it('blank gives unanswered marks', () => expect(scoreQuestion({ correct: [2], selected: [], multi: false }, rules).marks).toBe(0));
  it('multi exact match (any order) gets full marks', () => expect(scoreQuestion({ correct: [0, 3], selected: [3, 0], multi: true }, rules).marks).toBe(4));
  it('multi partial without wrong option gets 0', () => expect(scoreQuestion({ correct: [0, 3], selected: [0], multi: true }, rules)).toEqual({ status: 'partial', marks: 0 }));
  it('multi with a wrong option gets negative', () => expect(scoreQuestion({ correct: [0, 3], selected: [0, 1], multi: true }, rules).marks).toBe(-1));
  it('per-question marks override exam marks', () => expect(scoreQuestion({ correct: [1], selected: [0], multi: false, marks: 2, negative: 0.5 }, rules).marks).toBe(-0.5));
  it('totals add up', () => {
    const s = scoreAttempt([
      { correct: [0], selected: [0], multi: false },
      { correct: [1], selected: [2], multi: false },
      { correct: [1], selected: [], multi: false },
    ], rules);
    expect(s).toMatchObject({ correct: 1, wrong: 1, unanswered: 1, score: 3, max: 12, percentage: 25, accuracy: 50 });
  });
});

describe('CBT timer', () => {
  it('uses server offset, not device clock', () => {
    const deadline = '2026-01-01T10:10:00Z';
    const client = new Date('2026-01-01T10:00:00Z').getTime();
    expect(remainingSeconds(deadline, client, 0)).toBe(600);
    expect(remainingSeconds(deadline, client, 120_000)).toBe(480); // device 2 min behind server
  });
  it('never negative', () => expect(remainingSeconds('2026-01-01T10:00:00Z', Date.parse('2026-01-01T11:00:00Z'), 0)).toBe(0));
});

describe('CBT exam categories', () => {
  const base = { starts_at: '2026-01-01T10:00:00Z', ends_at: '2026-01-01T12:00:00Z', active_attempt_id: null, last_attempt_id: null, results_released: false, attempts_used: 0, max_attempts: 1 };
  const at = (iso: string) => Date.parse(iso);
  it('upcoming before start', () => expect(categorize(base, at('2026-01-01T09:00:00Z'))).toBe('upcoming'));
  it('available inside window', () => expect(categorize(base, at('2026-01-01T11:00:00Z'))).toBe('available'));
  it('in progress when active attempt', () => expect(categorize({ ...base, active_attempt_id: 'a' }, at('2026-01-01T11:00:00Z'))).toBe('in_progress'));
  it('submitted when attempts used up and pending', () => expect(categorize({ ...base, attempts_used: 1, last_attempt_id: 'a' }, at('2026-01-01T11:00:00Z'))).toBe('submitted'));
  it('released result', () => expect(categorize({ ...base, attempts_used: 1, last_attempt_id: 'a', results_released: true }, at('2026-01-01T13:00:00Z'))).toBe('released'));
  it('expired with no attempt', () => expect(categorize(base, at('2026-01-01T13:00:00Z'))).toBe('expired'));
});
