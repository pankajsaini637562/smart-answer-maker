// Gamification System - XP, Levels, Badges, Streaks
import { supabase } from '@/integrations/supabase/client';

const GAMIFICATION_KEY = 'exam_master_gamification';

// Sync local gamification state to Supabase so it appears on the public leaderboard.
export async function syncGamificationToCloud(state: GamificationState): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('gamification').upsert({
      id: user.id,
      xp: state.xp,
      level: state.level,
      streak: state.streak,
      last_active_date: state.lastActiveDate || null,
      badges: state.badges.filter(b => b.unlockedAt).map(b => b.id) as any,
      updated_at: new Date().toISOString(),
    } as any, { onConflict: 'id' });
  } catch (e) {
    console.warn('Leaderboard sync failed', e);
  }
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string | null; // ISO date or null
  condition: string;
}

export interface GamificationState {
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  badges: Badge[];
  totalExamsCompleted: number;
  totalCorrectAnswers: number;
  perfectScores: number;
}

// XP required for each level (cumulative)
const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 4000,
  5000, 6500, 8000, 10000, 12500, 15000, 18000, 22000, 27000, 33000,
];

export function getLevelFromXP(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function getXPForNextLevel(level: number): number {
  return LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + 5000;
}

export function getXPProgress(xp: number): { current: number; needed: number; percent: number } {
  const level = getLevelFromXP(xp);
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextThreshold = getXPForNextLevel(level);
  const current = xp - currentThreshold;
  const needed = nextThreshold - currentThreshold;
  return { current, needed, percent: Math.round((current / needed) * 100) };
}

export const LEVEL_TITLES: Record<number, string> = {
  1: 'Beginner', 2: 'Learner', 3: 'Student', 4: 'Scholar', 5: 'Achiever',
  6: 'Expert', 7: 'Prodigy', 8: 'Master', 9: 'Genius', 10: 'Champion',
  11: 'Legend', 12: 'Sage', 13: 'Guru', 14: 'Titan', 15: 'Immortal',
  16: 'Overlord', 17: 'Supreme', 18: 'Divine', 19: 'Celestial', 20: 'Transcendent',
};

const DEFAULT_BADGES: Badge[] = [
  { id: 'first-exam', name: 'First Steps', description: 'Complete your first exam', icon: '🎯', unlockedAt: null, condition: 'exams >= 1' },
  { id: 'five-exams', name: 'Getting Serious', description: 'Complete 5 exams', icon: '📝', unlockedAt: null, condition: 'exams >= 5' },
  { id: 'ten-exams', name: 'Dedicated', description: 'Complete 10 exams', icon: '🏆', unlockedAt: null, condition: 'exams >= 10' },
  { id: 'perfect-score', name: 'Perfectionist', description: 'Score 100% on any exam', icon: '💎', unlockedAt: null, condition: 'perfectScores >= 1' },
  { id: 'streak-3', name: 'On Fire', description: '3-day practice streak', icon: '🔥', unlockedAt: null, condition: 'streak >= 3' },
  { id: 'streak-7', name: 'Week Warrior', description: '7-day practice streak', icon: '⚡', unlockedAt: null, condition: 'streak >= 7' },
  { id: 'streak-30', name: 'Monthly Master', description: '30-day practice streak', icon: '🌟', unlockedAt: null, condition: 'streak >= 30' },
  { id: 'xp-1000', name: 'XP Hunter', description: 'Earn 1000 XP', icon: '💰', unlockedAt: null, condition: 'xp >= 1000' },
  { id: 'xp-5000', name: 'XP Legend', description: 'Earn 5000 XP', icon: '👑', unlockedAt: null, condition: 'xp >= 5000' },
  { id: 'correct-100', name: 'Century', description: 'Get 100 correct answers', icon: '💯', unlockedAt: null, condition: 'correct >= 100' },
  { id: 'level-5', name: 'Achiever', description: 'Reach Level 5', icon: '🎖️', unlockedAt: null, condition: 'level >= 5' },
  { id: 'level-10', name: 'Champion', description: 'Reach Level 10', icon: '🏅', unlockedAt: null, condition: 'level >= 10' },
];

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function getGamificationState(): GamificationState {
  const data = localStorage.getItem(GAMIFICATION_KEY);
  if (!data) {
    const initial: GamificationState = {
      xp: 0, level: 1, streak: 0, longestStreak: 0,
      lastActiveDate: '', badges: [...DEFAULT_BADGES],
      totalExamsCompleted: 0, totalCorrectAnswers: 0, perfectScores: 0,
    };
    return initial;
  }
  return JSON.parse(data);
}

function saveState(state: GamificationState): void {
  localStorage.setItem(GAMIFICATION_KEY, JSON.stringify(state));
}

// Check and update streak
function updateStreak(state: GamificationState): GamificationState {
  const today = getToday();
  if (state.lastActiveDate === today) return state; // already active today

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let newStreak = state.streak;
  if (state.lastActiveDate === yesterdayStr) {
    newStreak = state.streak + 1;
  } else if (state.lastActiveDate !== today) {
    newStreak = 1; // streak broken, restart
  }

  return {
    ...state,
    streak: newStreak,
    longestStreak: Math.max(state.longestStreak, newStreak),
    lastActiveDate: today,
  };
}

// Check badge conditions
function checkBadges(state: GamificationState): GamificationState {
  const now = new Date().toISOString();
  const checks: Record<string, boolean> = {
    'first-exam': state.totalExamsCompleted >= 1,
    'five-exams': state.totalExamsCompleted >= 5,
    'ten-exams': state.totalExamsCompleted >= 10,
    'perfect-score': state.perfectScores >= 1,
    'streak-3': state.streak >= 3,
    'streak-7': state.streak >= 7,
    'streak-30': state.streak >= 30,
    'xp-1000': state.xp >= 1000,
    'xp-5000': state.xp >= 5000,
    'correct-100': state.totalCorrectAnswers >= 100,
    'level-5': state.level >= 5,
    'level-10': state.level >= 10,
  };

  const newBadges = state.badges.map(b => {
    if (b.unlockedAt) return b;
    if (checks[b.id]) return { ...b, unlockedAt: now };
    return b;
  });

  return { ...state, badges: newBadges };
}

// Calculate XP earned from an exam
export function calculateXP(accuracy: number, correct: number, timeSpent: number, totalQuestions: number): { xp: number; breakdown: { label: string; xp: number }[] } {
  const breakdown: { label: string; xp: number }[] = [];

  // Base XP for completing
  const baseXP = 10;
  breakdown.push({ label: 'Exam completed', xp: baseXP });

  // XP per correct answer
  const correctXP = correct * 5;
  breakdown.push({ label: `${correct} correct answers`, xp: correctXP });

  // Accuracy bonus
  let accuracyBonus = 0;
  if (accuracy >= 90) accuracyBonus = 50;
  else if (accuracy >= 70) accuracyBonus = 30;
  else if (accuracy >= 50) accuracyBonus = 15;
  if (accuracyBonus > 0) breakdown.push({ label: `${accuracy}% accuracy bonus`, xp: accuracyBonus });

  // Perfect score bonus
  if (accuracy === 100 && totalQuestions >= 5) {
    breakdown.push({ label: 'Perfect score!', xp: 100 });
    accuracyBonus += 100;
  }

  // Speed bonus (if completed in under 1 min per question average)
  const avgTime = timeSpent / totalQuestions;
  let speedBonus = 0;
  if (avgTime < 30) speedBonus = 20;
  else if (avgTime < 60) speedBonus = 10;
  if (speedBonus > 0) breakdown.push({ label: 'Speed bonus', xp: speedBonus });

  return { xp: baseXP + correctXP + accuracyBonus + speedBonus, breakdown };
}

// Record exam completion and return new unlocked badges
export function recordExamCompletion(accuracy: number, correct: number, timeSpent: number, totalQuestions: number): {
  state: GamificationState;
  xpEarned: number;
  xpBreakdown: { label: string; xp: number }[];
  newBadges: Badge[];
  leveledUp: boolean;
} {
  let state = getGamificationState();
  const oldLevel = state.level;
  const oldBadges = state.badges.filter(b => b.unlockedAt).map(b => b.id);

  // Calculate and add XP
  const { xp: xpEarned, breakdown } = calculateXP(accuracy, correct, timeSpent, totalQuestions);
  state.xp += xpEarned;
  state.level = getLevelFromXP(state.xp);
  state.totalExamsCompleted += 1;
  state.totalCorrectAnswers += correct;
  if (accuracy === 100 && totalQuestions >= 5) state.perfectScores += 1;

  // Update streak
  state = updateStreak(state);

  // Check badges
  state = checkBadges(state);

  const newBadges = state.badges.filter(b => b.unlockedAt && !oldBadges.includes(b.id));
  const leveledUp = state.level > oldLevel;

  saveState(state);
  return { state, xpEarned, xpBreakdown: breakdown, newBadges, leveledUp };
}

// Just update streak (e.g., on app open)
export function refreshStreak(): GamificationState {
  let state = getGamificationState();
  const today = getToday();
  
  // Check if streak is broken (more than 1 day gap)
  if (state.lastActiveDate && state.lastActiveDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    if (state.lastActiveDate !== yesterdayStr) {
      state.streak = 0; // Streak broken
      saveState(state);
    }
  }
  
  return state;
}
