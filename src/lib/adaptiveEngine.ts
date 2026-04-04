// Adaptive Learning Engine - adjusts difficulty based on performance

import { ExamResult } from '@/types/exam';

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'advanced';

export interface AdaptiveProfile {
  subjectProfiles: Record<string, SubjectProfile>;
}

export interface SubjectProfile {
  subject: string;
  currentDifficulty: DifficultyLevel;
  accuracy: number;
  totalAttempts: number;
  consecutiveCorrect: number;
  consecutiveWrong: number;
  masteredTopics: string[];
  weakTopics: string[];
  recommendedFocus: string[];
  lastUpdated: string;
}

const ADAPTIVE_KEY = 'exam_master_adaptive';

export function getAdaptiveProfile(): AdaptiveProfile {
  const data = localStorage.getItem(ADAPTIVE_KEY);
  if (!data) return { subjectProfiles: {} };
  return JSON.parse(data);
}

function saveAdaptiveProfile(profile: AdaptiveProfile): void {
  localStorage.setItem(ADAPTIVE_KEY, JSON.stringify(profile));
}

// Determine difficulty based on accuracy
function determineDifficulty(accuracy: number, attempts: number): DifficultyLevel {
  if (attempts < 2) return 'medium';
  if (accuracy < 40) return 'easy';
  if (accuracy < 60) return 'medium';
  if (accuracy < 80) return 'hard';
  return 'advanced';
}

// Update adaptive profile after exam completion
export function updateAdaptiveProfile(result: ExamResult, subject: string): SubjectProfile {
  const profile = getAdaptiveProfile();
  
  const existing = profile.subjectProfiles[subject] || {
    subject,
    currentDifficulty: 'medium' as DifficultyLevel,
    accuracy: 0,
    totalAttempts: 0,
    consecutiveCorrect: 0,
    consecutiveWrong: 0,
    masteredTopics: [],
    weakTopics: [],
    recommendedFocus: [],
    lastUpdated: new Date().toISOString(),
  };

  // Update running average accuracy
  const newAccuracy = Math.round(
    (existing.accuracy * existing.totalAttempts + result.accuracy) / (existing.totalAttempts + 1)
  );
  
  existing.totalAttempts += 1;
  existing.accuracy = newAccuracy;
  existing.lastUpdated = new Date().toISOString();

  // Track consecutive patterns
  if (result.accuracy >= 80) {
    existing.consecutiveCorrect += 1;
    existing.consecutiveWrong = 0;
  } else if (result.accuracy < 40) {
    existing.consecutiveWrong += 1;
    existing.consecutiveCorrect = 0;
  } else {
    existing.consecutiveCorrect = 0;
    existing.consecutiveWrong = 0;
  }

  // Adjust difficulty
  existing.currentDifficulty = determineDifficulty(newAccuracy, existing.totalAttempts);

  // Override: if 3+ consecutive high scores, bump up
  if (existing.consecutiveCorrect >= 3 && existing.currentDifficulty !== 'advanced') {
    const levels: DifficultyLevel[] = ['easy', 'medium', 'hard', 'advanced'];
    const idx = levels.indexOf(existing.currentDifficulty);
    existing.currentDifficulty = levels[Math.min(idx + 1, 3)];
  }

  // Override: if 3+ consecutive low scores, drop down
  if (existing.consecutiveWrong >= 3 && existing.currentDifficulty !== 'easy') {
    const levels: DifficultyLevel[] = ['easy', 'medium', 'hard', 'advanced'];
    const idx = levels.indexOf(existing.currentDifficulty);
    existing.currentDifficulty = levels[Math.max(idx - 1, 0)];
  }

  // Identify weak/mastered from question results
  const wrongQuestions = result.questionResults.filter(q => !q.isCorrect && q.userAnswer !== null);
  const correctQuestions = result.questionResults.filter(q => q.isCorrect);

  // Mark topic as weak if > 50% questions wrong
  if (wrongQuestions.length > result.totalQuestions * 0.5) {
    if (!existing.weakTopics.includes(subject)) {
      existing.weakTopics.push(subject);
    }
    existing.masteredTopics = existing.masteredTopics.filter(t => t !== subject);
  } else if (result.accuracy >= 85 && existing.totalAttempts >= 3) {
    if (!existing.masteredTopics.includes(subject)) {
      existing.masteredTopics.push(subject);
    }
    existing.weakTopics = existing.weakTopics.filter(t => t !== subject);
  }

  profile.subjectProfiles[subject] = existing;
  saveAdaptiveProfile(profile);
  return existing;
}

// Get study recommendations based on all profiles
export function getStudyRecommendations(results: ExamResult[]): StudyRecommendation[] {
  const profile = getAdaptiveProfile();
  const recommendations: StudyRecommendation[] = [];

  // Group results by subject
  const subjectResults: Record<string, ExamResult[]> = {};
  results.forEach(r => {
    const key = r.sheetTitle;
    if (!subjectResults[key]) subjectResults[key] = [];
    subjectResults[key].push(r);
  });

  // Analyze each subject
  Object.entries(profile.subjectProfiles).forEach(([subject, sp]) => {
    if (sp.accuracy < 40) {
      recommendations.push({
        type: 'revise',
        priority: 'critical',
        subject,
        message: `Revise ${subject} fundamentals`,
        detail: `Your accuracy is only ${sp.accuracy}%. Focus on core concepts before attempting more tests.`,
        icon: '📚',
      });
    } else if (sp.accuracy < 60) {
      recommendations.push({
        type: 'practice',
        priority: 'high',
        subject,
        message: `Practice more ${subject} questions`,
        detail: `At ${sp.accuracy}% accuracy, you need more focused practice. Try 10-15 questions daily.`,
        icon: '📝',
      });
    }

    if (sp.consecutiveWrong >= 2) {
      recommendations.push({
        type: 'strategy',
        priority: 'high',
        subject,
        message: `Change study approach for ${subject}`,
        detail: `You've had ${sp.consecutiveWrong} low-scoring attempts in a row. Try a different study method.`,
        icon: '🔄',
      });
    }

    if (sp.accuracy >= 80 && sp.totalAttempts >= 3) {
      recommendations.push({
        type: 'advance',
        priority: 'low',
        subject,
        message: `${subject} is looking strong!`,
        detail: `With ${sp.accuracy}% accuracy across ${sp.totalAttempts} attempts, consider harder topics.`,
        icon: '🚀',
      });
    }
  });

  // Sort: critical first
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recommendations;
}

export interface StudyRecommendation {
  type: 'revise' | 'practice' | 'strategy' | 'advance' | 'streak';
  priority: 'critical' | 'high' | 'medium' | 'low';
  subject: string;
  message: string;
  detail: string;
  icon: string;
}

// Get predicted exam score based on history
export function predictScore(results: ExamResult[], subject: string): {
  predicted: number;
  confidence: number;
  range: [number, number];
} {
  const subjectResults = results.filter(r => r.sheetTitle.toLowerCase().includes(subject.toLowerCase()));
  
  if (subjectResults.length < 2) {
    return { predicted: 50, confidence: 20, range: [30, 70] };
  }

  const sorted = [...subjectResults].sort((a, b) => 
    new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );

  // Weighted average (recent scores matter more)
  const weights = sorted.slice(0, 5).map((_, i) => 5 - i);
  const weightedSum = sorted.slice(0, 5).reduce((s, r, i) => s + r.accuracy * weights[i], 0);
  const totalWeight = weights.reduce((s, w) => s + w, 0);
  const predicted = Math.round(weightedSum / totalWeight);

  // Confidence based on number of data points and consistency
  const accuracies = sorted.map(r => r.accuracy);
  const stdDev = Math.sqrt(accuracies.reduce((s, a) => s + (a - predicted) ** 2, 0) / accuracies.length);
  const confidence = Math.min(95, Math.max(20, Math.round(100 - stdDev)));

  const margin = Math.round(stdDev * 1.5);
  const range: [number, number] = [
    Math.max(0, predicted - margin),
    Math.min(100, predicted + margin),
  ];

  return { predicted, confidence, range };
}
