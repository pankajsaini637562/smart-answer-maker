import { ExamResult } from '@/types/exam';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Grid3x3 } from 'lucide-react';
import { useMemo } from 'react';

interface WeakTopicHeatmapProps {
  results: ExamResult[];
}

function getColor(accuracy: number): string {
  if (accuracy >= 80) return 'bg-success/70';
  if (accuracy >= 60) return 'bg-success/30';
  if (accuracy >= 40) return 'bg-warning/50';
  if (accuracy >= 20) return 'bg-destructive/40';
  return 'bg-destructive/70';
}

export function WeakTopicHeatmap({ results }: WeakTopicHeatmapProps) {
  const topicData = useMemo(() => {
    const grouped: Record<string, { accuracies: number[] }> = {};
    results.forEach(r => {
      if (!grouped[r.sheetTitle]) grouped[r.sheetTitle] = { accuracies: [] };
      grouped[r.sheetTitle].accuracies.push(r.accuracy);
    });

    return Object.entries(grouped).map(([title, data]) => {
      const avg = Math.round(data.accuracies.reduce((s, a) => s + a, 0) / data.accuracies.length);
      return { title, accuracy: avg, attempts: data.accuracies.length };
    }).sort((a, b) => a.accuracy - b.accuracy);
  }, [results]);

  if (topicData.length === 0) return null;

  return (
    <Card className="modern-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-display flex items-center gap-2">
          <Grid3x3 className="w-4 h-4 text-primary" /> Topic Strength Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {topicData.map(t => (
            <Tooltip key={t.title}>
              <TooltipTrigger asChild>
                <div className={`${getColor(t.accuracy)} rounded-lg p-2.5 text-center cursor-default transition-transform hover:scale-105`}>
                  <p className="text-[10px] font-medium truncate text-foreground">{t.title}</p>
                  <p className="text-sm font-bold font-mono text-foreground">{t.accuracy}%</p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t.title}: {t.accuracy}% avg across {t.attempts} attempt{t.attempts > 1 ? 's' : ''}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
        <div className="flex items-center justify-center gap-2 mt-3 text-[10px] text-muted-foreground">
          <span className="w-3 h-3 rounded bg-destructive/70" /> Weak
          <span className="w-3 h-3 rounded bg-warning/50" /> Average
          <span className="w-3 h-3 rounded bg-success/70" /> Strong
        </div>
      </CardContent>
    </Card>
  );
}
