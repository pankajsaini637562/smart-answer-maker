import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Brain, TrendingUp, BarChart3, Lightbulb, Target, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AppHeader } from '@/components/AppHeader';
import { getResults, getSheets } from '@/lib/storage';
import { ExamResult } from '@/types/exam';

function analyzePerformance(results: ExamResult[]) {
  if (results.length === 0) return null;

  const totalExams = results.length;
  const avgAccuracy = Math.round(results.reduce((s, r) => s + r.accuracy, 0) / totalExams);
  const avgScore = Math.round(results.reduce((s, r) => s + (r.score / r.maxScore) * 100, 0) / totalExams);

  // Trend: compare last 3 vs previous 3
  const recent = results.slice(0, Math.min(3, totalExams));
  const older = results.slice(3, Math.min(6, totalExams));
  const recentAvg = recent.reduce((s, r) => s + r.accuracy, 0) / recent.length;
  const olderAvg = older.length > 0 ? older.reduce((s, r) => s + r.accuracy, 0) / older.length : recentAvg;
  const trend = recentAvg - olderAvg;

  // Readiness score (0-100)
  const consistencyBonus = totalExams >= 5 ? 10 : 0;
  const trendBonus = trend > 0 ? Math.min(trend, 15) : Math.max(trend, -10);
  const readiness = Math.max(0, Math.min(100, Math.round(avgAccuracy * 0.7 + consistencyBonus + trendBonus + Math.min(totalExams * 2, 20))));

  // Question difficulty analysis
  const questionStats: Record<number, { total: number; correct: number }> = {};
  results.forEach(r => {
    r.questionResults.forEach(qr => {
      if (!questionStats[qr.questionNumber]) {
        questionStats[qr.questionNumber] = { total: 0, correct: 0 };
      }
      questionStats[qr.questionNumber].total++;
      if (qr.isCorrect) questionStats[qr.questionNumber].correct++;
    });
  });

  const difficulties = Object.entries(questionStats).map(([num, stat]) => ({
    questionNumber: parseInt(num),
    accuracy: Math.round((stat.correct / stat.total) * 100),
    attempts: stat.total,
    difficulty: (stat.correct / stat.total) < 0.4 ? 'hard' as const : (stat.correct / stat.total) < 0.7 ? 'medium' as const : 'easy' as const,
  }));

  const hardQuestions = difficulties.filter(d => d.difficulty === 'hard').sort((a, b) => a.accuracy - b.accuracy);
  const easyQuestions = difficulties.filter(d => d.difficulty === 'easy').sort((a, b) => b.accuracy - a.accuracy);

  // Study tips
  const tips: { icon: typeof Brain; title: string; description: string; priority: 'high' | 'medium' | 'low' }[] = [];

  if (avgAccuracy < 50) {
    tips.push({ icon: AlertTriangle, title: 'Focus on Fundamentals', description: 'Your average accuracy is below 50%. Revisit core concepts before attempting more tests.', priority: 'high' });
  }
  if (hardQuestions.length > 0) {
    tips.push({ icon: Target, title: `Weak Area: Questions ${hardQuestions.slice(0, 3).map(q => q.questionNumber).join(', ')}`, description: `You consistently struggle with these question positions. They may relate to specific topics—review those areas.`, priority: 'high' });
  }
  if (trend < -5) {
    tips.push({ icon: TrendingUp, title: 'Declining Performance', description: 'Your recent scores are trending down. Consider taking a break or changing your study approach.', priority: 'high' });
  }
  if (trend > 5) {
    tips.push({ icon: CheckCircle2, title: 'Great Improvement!', description: `You've improved by ${Math.round(trend)}% recently. Keep up this momentum!`, priority: 'low' });
  }
  if (totalExams < 5) {
    tips.push({ icon: Lightbulb, title: 'Take More Tests', description: 'Complete at least 5 exams for more accurate analytics and performance predictions.', priority: 'medium' });
  }

  const wrongRate = results.reduce((s, r) => s + r.wrong, 0) / results.reduce((s, r) => s + r.totalQuestions, 0);
  if (wrongRate > 0.3) {
    tips.push({ icon: AlertTriangle, title: 'Reduce Wrong Answers', description: `You're getting ${Math.round(wrongRate * 100)}% wrong. Consider being more selective—skip uncertain questions to avoid negative marking.`, priority: 'medium' });
  }

  const unattemptedRate = results.reduce((s, r) => s + r.unattempted, 0) / results.reduce((s, r) => s + r.totalQuestions, 0);
  if (unattemptedRate > 0.2) {
    tips.push({ icon: Clock, title: 'Improve Time Management', description: `You're leaving ${Math.round(unattemptedRate * 100)}% questions unattempted. Practice speed and time allocation.`, priority: 'medium' });
  }

  // Predicted next score
  const weights = recent.map((_, i) => recent.length - i);
  const weightedSum = recent.reduce((s, r, i) => s + r.accuracy * weights[i], 0);
  const totalWeight = weights.reduce((s, w) => s + w, 0);
  const predictedAccuracy = Math.round(weightedSum / totalWeight + (trend > 0 ? trend * 0.3 : trend * 0.1));

  return {
    avgAccuracy,
    avgScore,
    trend: Math.round(trend),
    readiness,
    hardQuestions: hardQuestions.slice(0, 5),
    easyQuestions: easyQuestions.slice(0, 5),
    tips: tips.sort((a, b) => { const p = { high: 0, medium: 1, low: 2 }; return p[a.priority] - p[b.priority]; }),
    predictedAccuracy: Math.max(0, Math.min(100, predictedAccuracy)),
    totalExams,
    accuracyHistory: results.slice(0, 10).reverse().map((r, i) => ({ exam: i + 1, accuracy: r.accuracy, score: Math.round((r.score / r.maxScore) * 100) })),
  };
}

export default function AnalyticsPage() {
  const results = getResults();
  const analysis = useMemo(() => analyzePerformance(results), [results]);

  if (!analysis) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="container py-12 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Brain className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">No Data Yet</h2>
          <p className="text-muted-foreground mb-6">Complete some exams to unlock AI-powered analytics</p>
          <Link to="/create"><Button>Create Your First Sheet</Button></Link>
        </main>
      </div>
    );
  }

  const readinessColor = analysis.readiness >= 70 ? 'text-green-600 dark:text-green-400' : analysis.readiness >= 40 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400';
  const trendIcon = analysis.trend > 0 ? '↑' : analysis.trend < 0 ? '↓' : '→';

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container py-8 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <Link to="/"><Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button></Link>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary" /> AI Analytics
            </h2>
            <p className="text-muted-foreground text-sm">Smart insights from {analysis.totalExams} exams</p>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Readiness</p>
              <p className={`text-3xl font-bold ${readinessColor}`}>{analysis.readiness}%</p>
              <Progress value={analysis.readiness} className="mt-2 h-2" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Avg Accuracy</p>
              <p className="text-3xl font-bold text-primary">{analysis.avgAccuracy}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Trend</p>
              <p className={`text-3xl font-bold ${analysis.trend > 0 ? 'text-green-600 dark:text-green-400' : analysis.trend < 0 ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`}>
                {trendIcon} {Math.abs(analysis.trend)}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Predicted Next</p>
              <p className="text-3xl font-bold text-primary">{analysis.predictedAccuracy}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Study Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Lightbulb className="w-5 h-5 text-primary" /> Study Recommendations</CardTitle>
            <CardDescription>Personalized tips based on your performance patterns</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysis.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  tip.priority === 'high' ? 'bg-destructive/10 text-destructive' : tip.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' : 'bg-green-500/10 text-green-600 dark:text-green-400'
                }`}>
                  <tip.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-sm">{tip.title}</p>
                  <p className="text-sm text-muted-foreground">{tip.description}</p>
                </div>
                <Badge variant={tip.priority === 'high' ? 'destructive' : 'secondary'} className="shrink-0 ml-auto">
                  {tip.priority}
                </Badge>
              </div>
            ))}
            {analysis.tips.length === 0 && (
              <p className="text-muted-foreground text-center py-4">Great job! No major issues detected.</p>
            )}
          </CardContent>
        </Card>

        {/* Accuracy Trend Chart (simple visual) */}
        {analysis.accuracyHistory.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> Performance Trend</CardTitle>
              <CardDescription>Your accuracy over recent exams</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-40">
                {analysis.accuracyHistory.map((point, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-medium text-muted-foreground">{point.accuracy}%</span>
                    <div
                      className="w-full rounded-t-md bg-primary/80 transition-all"
                      style={{ height: `${Math.max(point.accuracy, 5)}%` }}
                    />
                    <span className="text-xs text-muted-foreground">#{point.exam}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Question Difficulty */}
        <div className="grid md:grid-cols-2 gap-4">
          {analysis.hardQuestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="w-5 h-5" /> Hardest Questions</CardTitle>
                <CardDescription>Questions you struggle with most</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {analysis.hardQuestions.map(q => (
                  <div key={q.questionNumber} className="flex items-center justify-between p-2 rounded-md bg-destructive/5">
                    <span className="font-medium">Q{q.questionNumber}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={q.accuracy} className="w-24 h-2" />
                      <span className="text-sm text-muted-foreground w-12 text-right">{q.accuracy}%</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          {analysis.easyQuestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400"><CheckCircle2 className="w-5 h-5" /> Strongest Questions</CardTitle>
                <CardDescription>Questions you consistently ace</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {analysis.easyQuestions.map(q => (
                  <div key={q.questionNumber} className="flex items-center justify-between p-2 rounded-md bg-green-500/5">
                    <span className="font-medium">Q{q.questionNumber}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={q.accuracy} className="w-24 h-2" />
                      <span className="text-sm text-muted-foreground w-12 text-right">{q.accuracy}%</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
