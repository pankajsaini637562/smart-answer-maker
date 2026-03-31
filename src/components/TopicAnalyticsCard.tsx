import { TopicAnalysis } from '@/lib/analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Target, TrendingUp, Clock, Zap, AlertTriangle, CheckCircle2, Brain, BarChart3 } from 'lucide-react';

const masteryConfig = {
  beginner: { label: 'Beginner', color: 'bg-destructive/10 text-destructive border-destructive/20' },
  developing: { label: 'Developing', color: 'bg-warning/10 text-warning border-warning/20' },
  proficient: { label: 'Proficient', color: 'bg-primary/10 text-primary border-primary/20' },
  master: { label: 'Mastered', color: 'bg-success/10 text-success border-success/20' },
};

const speedIcon = { faster: '⚡', slower: '🐢', stable: '➡️' };

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function TopicAnalyticsCard({ topic }: { topic: TopicAnalysis }) {
  const mastery = masteryConfig[topic.masteryLevel];
  const trendIcon = topic.trend > 0 ? '↑' : topic.trend < 0 ? '↓' : '→';
  const trendColor = topic.trend > 0 ? 'text-success' : topic.trend < 0 ? 'text-destructive' : 'text-muted-foreground';

  return (
    <Card className="modern-card overflow-hidden animate-slide-up">
      {/* Header with mastery badge */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <CardTitle className="text-lg font-display truncate">{topic.sheetTitle}</CardTitle>
            <CardDescription>{topic.totalAttempts} attempt{topic.totalAttempts !== 1 ? 's' : ''} • Avg {formatTime(topic.avgTimeSpent)}</CardDescription>
          </div>
          <Badge variant="outline" className={`shrink-0 ${mastery.color}`}>
            {mastery.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Key metrics row */}
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center p-2 rounded-xl bg-accent/50">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Accuracy</p>
            <p className="text-lg font-bold font-mono text-primary">{topic.avgAccuracy}%</p>
          </div>
          <div className="text-center p-2 rounded-xl bg-accent/50">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Best</p>
            <p className="text-lg font-bold font-mono text-success">{topic.bestAccuracy}%</p>
          </div>
          <div className="text-center p-2 rounded-xl bg-accent/50">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Trend</p>
            <p className={`text-lg font-bold font-mono ${trendColor}`}>{trendIcon}{Math.abs(topic.trend)}%</p>
          </div>
          <div className="text-center p-2 rounded-xl bg-accent/50">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Predict</p>
            <p className="text-lg font-bold font-mono text-primary">{topic.predictedNext}%</p>
          </div>
        </div>

        {/* Consistency & improvement */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> Consistency</span>
            <span className="font-medium font-mono">{topic.consistencyScore}%</span>
          </div>
          <Progress value={topic.consistencyScore} className="h-1.5" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> Improvement</span>
            <span className={`font-medium font-mono ${topic.improvementRate >= 0 ? 'text-success' : 'text-destructive'}`}>
              {topic.improvementRate >= 0 ? '+' : ''}{topic.improvementRate}%
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Speed</span>
            <span className="font-medium">{speedIcon[topic.speedTrend]} {topic.speedTrend}</span>
          </div>
        </div>

        {/* Mini chart */}
        {topic.accuracyHistory.length > 1 && (
          <div className="pt-2">
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><BarChart3 className="w-3 h-3" /> Accuracy Trend</p>
            <div className="flex items-end gap-1 h-16">
              {topic.accuracyHistory.map((point, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                  <span className="text-[9px] font-mono text-muted-foreground">{point.accuracy}%</span>
                  <div
                    className="w-full rounded-t bg-primary/70 min-h-[2px] transition-all"
                    style={{ height: `${Math.max(point.accuracy * 0.6, 3)}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expandable details */}
        <Accordion type="single" collapsible className="w-full">
          {/* Tips */}
          {topic.tips.length > 0 && (
            <AccordionItem value="tips" className="border-b-0">
              <AccordionTrigger className="py-2 text-sm hover:no-underline">
                <span className="flex items-center gap-1.5"><Brain className="w-4 h-4 text-primary" /> AI Tips ({topic.tips.length})</span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {topic.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-muted/50 text-sm">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                        tip.priority === 'high' ? 'bg-destructive' : tip.priority === 'medium' ? 'bg-warning' : 'bg-success'
                      }`} />
                      <div>
                        <p className="font-medium text-xs">{tip.title}</p>
                        <p className="text-xs text-muted-foreground">{tip.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Hard questions */}
          {topic.hardQuestions.length > 0 && (
            <AccordionItem value="hard" className="border-b-0">
              <AccordionTrigger className="py-2 text-sm hover:no-underline">
                <span className="flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-destructive" /> Weak Questions ({topic.hardQuestions.length})</span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-1">
                  {topic.hardQuestions.map(q => (
                    <div key={q.questionNumber} className="flex items-center justify-between p-1.5 rounded bg-destructive/5 text-sm">
                      <span className="font-mono text-xs">Q{q.questionNumber}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={q.accuracy} className="w-16 h-1.5" />
                        <span className="text-xs font-mono text-muted-foreground w-8 text-right">{q.accuracy}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Easy questions */}
          {topic.easyQuestions.length > 0 && (
            <AccordionItem value="easy" className="border-b-0">
              <AccordionTrigger className="py-2 text-sm hover:no-underline">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-success" /> Strong Questions ({topic.easyQuestions.length})</span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-1">
                  {topic.easyQuestions.map(q => (
                    <div key={q.questionNumber} className="flex items-center justify-between p-1.5 rounded bg-success/5 text-sm">
                      <span className="font-mono text-xs">Q{q.questionNumber}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={q.accuracy} className="w-16 h-1.5" />
                        <span className="text-xs font-mono text-muted-foreground w-8 text-right">{q.accuracy}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
    </Card>
  );
}
