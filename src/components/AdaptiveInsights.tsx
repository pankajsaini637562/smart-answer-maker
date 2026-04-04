import { getAdaptiveProfile, getStudyRecommendations, type StudyRecommendation } from '@/lib/adaptiveEngine';
import { ExamResult } from '@/types/exam';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles } from 'lucide-react';

interface AdaptiveInsightsProps {
  results: ExamResult[];
}

const difficultyColors: Record<string, string> = {
  easy: 'bg-success/10 text-success border-success/20',
  medium: 'bg-warning/10 text-warning border-warning/20',
  hard: 'bg-destructive/10 text-destructive border-destructive/20',
  advanced: 'bg-primary/10 text-primary border-primary/20',
};

const priorityColors: Record<string, string> = {
  critical: 'destructive',
  high: 'destructive',
  medium: 'secondary',
  low: 'outline',
};

export function AdaptiveInsights({ results }: AdaptiveInsightsProps) {
  const profile = getAdaptiveProfile();
  const recommendations = getStudyRecommendations(results);
  const subjects = Object.values(profile.subjectProfiles);

  if (subjects.length === 0 && recommendations.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Difficulty Levels */}
      {subjects.length > 0 && (
        <Card className="modern-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-display flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" /> Adaptive Difficulty Levels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {subjects.map(sp => (
                <div key={sp.subject} className="flex items-center justify-between p-3 rounded-xl bg-accent/30">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{sp.subject}</p>
                    <p className="text-xs text-muted-foreground">{sp.accuracy}% avg • {sp.totalAttempts} attempts</p>
                  </div>
                  <Badge variant="outline" className={`shrink-0 ml-2 ${difficultyColors[sp.currentDifficulty]}`}>
                    {sp.currentDifficulty}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <Card className="modern-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-display flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> AI Study Coach
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recommendations.slice(0, 6).map((rec, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                <span className="text-xl shrink-0">{rec.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{rec.message}</p>
                    <Badge variant={priorityColors[rec.priority] as any} className="text-[10px] shrink-0">
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{rec.detail}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
