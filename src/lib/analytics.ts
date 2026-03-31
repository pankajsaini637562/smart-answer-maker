import { ExamResult } from '@/types/exam';

export interface TopicAnalysis {
  sheetTitle: string;
  sheetId: string;
  totalAttempts: number;
  avgAccuracy: number;
  avgScore: number;
  bestAccuracy: number;
  worstAccuracy: number;
  trend: number;
  predictedNext: number;
  avgTimeSpent: number;
  consistencyScore: number; // how consistent scores are (0-100, higher = more consistent)
  improvementRate: number; // % improvement from first to last attempt
  hardQuestions: { questionNumber: number; accuracy: number }[];
  easyQuestions: { questionNumber: number; accuracy: number }[];
  tips: AnalyticsTip[];
  accuracyHistory: { attempt: number; accuracy: number; score: number }[];
  speedTrend: 'faster' | 'slower' | 'stable';
  masteryLevel: 'beginner' | 'developing' | 'proficient' | 'master';
}

export interface OverallAnalysis {
  totalExams: number;
  avgAccuracy: number;
  avgScore: number;
  readiness: number;
  trend: number;
  predictedAccuracy: number;
  strongestTopic: string | null;
  weakestTopic: string | null;
  totalStudyTime: number;
  overallTips: AnalyticsTip[];
  topicAnalyses: TopicAnalysis[];
}

export interface AnalyticsTip {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'accuracy' | 'speed' | 'consistency' | 'strategy' | 'motivation';
}

function getMasteryLevel(avgAccuracy: number, attempts: number): TopicAnalysis['masteryLevel'] {
  if (attempts < 2 || avgAccuracy < 40) return 'beginner';
  if (avgAccuracy < 60) return 'developing';
  if (avgAccuracy < 80) return 'proficient';
  return 'master';
}

function getConsistencyScore(accuracies: number[]): number {
  if (accuracies.length < 2) return 50;
  const mean = accuracies.reduce((s, a) => s + a, 0) / accuracies.length;
  const variance = accuracies.reduce((s, a) => s + (a - mean) ** 2, 0) / accuracies.length;
  const stdDev = Math.sqrt(variance);
  return Math.max(0, Math.min(100, Math.round(100 - stdDev * 2)));
}

function analyzeTopicQuestions(results: ExamResult[]) {
  const questionStats: Record<number, { total: number; correct: number }> = {};
  results.forEach(r => {
    r.questionResults.forEach(qr => {
      if (!questionStats[qr.questionNumber]) questionStats[qr.questionNumber] = { total: 0, correct: 0 };
      questionStats[qr.questionNumber].total++;
      if (qr.isCorrect) questionStats[qr.questionNumber].correct++;
    });
  });

  const all = Object.entries(questionStats).map(([num, stat]) => ({
    questionNumber: parseInt(num),
    accuracy: Math.round((stat.correct / stat.total) * 100),
  }));

  return {
    hard: all.filter(q => q.accuracy < 40).sort((a, b) => a.accuracy - b.accuracy).slice(0, 5),
    easy: all.filter(q => q.accuracy >= 70).sort((a, b) => b.accuracy - a.accuracy).slice(0, 5),
  };
}

function generateTopicTips(topic: TopicAnalysis): AnalyticsTip[] {
  const tips: AnalyticsTip[] = [];

  if (topic.avgAccuracy < 40) {
    tips.push({ title: 'Revisit Fundamentals', description: `Your accuracy in "${topic.sheetTitle}" is ${topic.avgAccuracy}%. Focus on core concepts before retesting.`, priority: 'high', category: 'accuracy' });
  }
  if (topic.trend < -5) {
    tips.push({ title: 'Declining Performance', description: `Your recent scores are dropping. Try a different study approach for this topic.`, priority: 'high', category: 'strategy' });
  }
  if (topic.trend > 5) {
    tips.push({ title: 'Great Progress!', description: `You've improved by ${Math.round(topic.trend)}% recently. Keep it up!`, priority: 'low', category: 'motivation' });
  }
  if (topic.consistencyScore < 40) {
    tips.push({ title: 'Inconsistent Scores', description: `Your scores vary a lot. Focus on solidifying knowledge rather than guessing.`, priority: 'medium', category: 'consistency' });
  }
  if (topic.speedTrend === 'slower') {
    tips.push({ title: 'Speed Declining', description: `You're taking more time on recent attempts. Practice timed sessions.`, priority: 'medium', category: 'speed' });
  }
  if (topic.hardQuestions.length >= 3) {
    tips.push({ title: `Weak Spots: Q${topic.hardQuestions.slice(0, 3).map(q => q.questionNumber).join(', ')}`, description: `These questions have <40% accuracy. They likely relate to specific sub-topics.`, priority: 'high', category: 'accuracy' });
  }
  if (topic.masteryLevel === 'master') {
    tips.push({ title: 'Topic Mastered!', description: `Excellent mastery. Consider moving to harder topics or helping peers.`, priority: 'low', category: 'motivation' });
  }

  return tips.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority]));
}

export function analyzeByTopic(results: ExamResult[]): OverallAnalysis | null {
  if (results.length === 0) return null;

  // Group by sheetId
  const grouped: Record<string, ExamResult[]> = {};
  results.forEach(r => {
    if (!grouped[r.sheetId]) grouped[r.sheetId] = [];
    grouped[r.sheetId].push(r);
  });

  const topicAnalyses: TopicAnalysis[] = Object.entries(grouped).map(([sheetId, topicResults]) => {
    // Sort by date (newest first for trend, oldest first for history)
    const sorted = [...topicResults].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    const n = sorted.length;
    const accuracies = sorted.map(r => r.accuracy);

    const avgAccuracy = Math.round(accuracies.reduce((s, a) => s + a, 0) / n);
    const avgScore = Math.round(sorted.reduce((s, r) => s + (r.score / r.maxScore) * 100, 0) / n);
    const bestAccuracy = Math.max(...accuracies);
    const worstAccuracy = Math.min(...accuracies);

    // Trend
    const recent = sorted.slice(0, Math.min(3, n));
    const older = sorted.slice(3, Math.min(6, n));
    const recentAvg = recent.reduce((s, r) => s + r.accuracy, 0) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((s, r) => s + r.accuracy, 0) / older.length : recentAvg;
    const trend = Math.round(recentAvg - olderAvg);

    // Predicted
    const weights = recent.map((_, i) => recent.length - i);
    const weightedSum = recent.reduce((s, r, i) => s + r.accuracy * weights[i], 0);
    const totalWeight = weights.reduce((s, w) => s + w, 0);
    const predictedNext = Math.max(0, Math.min(100, Math.round(weightedSum / totalWeight + (trend > 0 ? trend * 0.3 : trend * 0.1))));

    const avgTimeSpent = Math.round(sorted.reduce((s, r) => s + r.timeSpent, 0) / n);
    const consistencyScore = getConsistencyScore(accuracies);

    // Improvement rate
    const firstAcc = sorted[sorted.length - 1].accuracy;
    const lastAcc = sorted[0].accuracy;
    const improvementRate = n > 1 ? Math.round(lastAcc - firstAcc) : 0;

    // Speed trend
    const recentTime = recent.reduce((s, r) => s + r.timeSpent, 0) / recent.length;
    const olderTime = older.length > 0 ? older.reduce((s, r) => s + r.timeSpent, 0) / older.length : recentTime;
    const speedTrend: TopicAnalysis['speedTrend'] = recentTime > olderTime * 1.1 ? 'slower' : recentTime < olderTime * 0.9 ? 'faster' : 'stable';

    const { hard, easy } = analyzeTopicQuestions(sorted);

    const analysis: TopicAnalysis = {
      sheetTitle: sorted[0].sheetTitle,
      sheetId,
      totalAttempts: n,
      avgAccuracy,
      avgScore,
      bestAccuracy,
      worstAccuracy,
      trend,
      predictedNext,
      avgTimeSpent,
      consistencyScore,
      improvementRate,
      hardQuestions: hard,
      easyQuestions: easy,
      tips: [],
      accuracyHistory: sorted.slice(0, 10).reverse().map((r, i) => ({
        attempt: i + 1,
        accuracy: r.accuracy,
        score: Math.round((r.score / r.maxScore) * 100),
      })),
      speedTrend,
      masteryLevel: getMasteryLevel(avgAccuracy, n),
    };
    analysis.tips = generateTopicTips(analysis);
    return analysis;
  });

  // Sort topics: weakest first
  topicAnalyses.sort((a, b) => a.avgAccuracy - b.avgAccuracy);

  // Overall
  const totalExams = results.length;
  const avgAccuracy = Math.round(results.reduce((s, r) => s + r.accuracy, 0) / totalExams);
  const avgScore = Math.round(results.reduce((s, r) => s + (r.score / r.maxScore) * 100, 0) / totalExams);
  const totalStudyTime = results.reduce((s, r) => s + r.timeSpent, 0);

  const sortedAll = [...results].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  const recent = sortedAll.slice(0, Math.min(3, totalExams));
  const older = sortedAll.slice(3, Math.min(6, totalExams));
  const recentAvg = recent.reduce((s, r) => s + r.accuracy, 0) / recent.length;
  const olderAvg = older.length > 0 ? older.reduce((s, r) => s + r.accuracy, 0) / older.length : recentAvg;
  const trend = Math.round(recentAvg - olderAvg);

  const consistencyBonus = totalExams >= 5 ? 10 : 0;
  const trendBonus = trend > 0 ? Math.min(trend, 15) : Math.max(trend, -10);
  const readiness = Math.max(0, Math.min(100, Math.round(avgAccuracy * 0.7 + consistencyBonus + trendBonus + Math.min(totalExams * 2, 20))));

  const weights = recent.map((_, i) => recent.length - i);
  const weightedSum = recent.reduce((s, r, i) => s + r.accuracy * weights[i], 0);
  const totalWeight = weights.reduce((s, w) => s + w, 0);
  const predictedAccuracy = Math.max(0, Math.min(100, Math.round(weightedSum / totalWeight + (trend > 0 ? trend * 0.3 : trend * 0.1))));

  const strongestTopic = topicAnalyses.length > 0 ? topicAnalyses[topicAnalyses.length - 1].sheetTitle : null;
  const weakestTopic = topicAnalyses.length > 0 ? topicAnalyses[0].sheetTitle : null;

  const overallTips: AnalyticsTip[] = [];
  if (totalExams < 5) {
    overallTips.push({ title: 'Take More Tests', description: 'Complete at least 5 exams for better predictions.', priority: 'medium', category: 'strategy' });
  }
  if (weakestTopic && strongestTopic && weakestTopic !== strongestTopic) {
    overallTips.push({ title: `Focus on "${weakestTopic}"`, description: `This is your weakest topic. Dedicate more study time here.`, priority: 'high', category: 'strategy' });
  }

  return {
    totalExams,
    avgAccuracy,
    avgScore,
    readiness,
    trend,
    predictedAccuracy,
    strongestTopic,
    weakestTopic,
    totalStudyTime,
    overallTips,
    topicAnalyses,
  };
}
