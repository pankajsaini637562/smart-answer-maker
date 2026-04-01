import { useState } from 'react';
import { TopicAnalysis } from '@/lib/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftRight, Trophy, TrendingUp, Target, Zap, Clock, BarChart3 } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';

const masteryConfig = {
  beginner: { label: 'Beginner', color: 'bg-destructive/10 text-destructive border-destructive/20' },
  developing: { label: 'Developing', color: 'bg-warning/10 text-warning border-warning/20' },
  proficient: { label: 'Proficient', color: 'bg-primary/10 text-primary border-primary/20' },
  master: { label: 'Mastered', color: 'bg-success/10 text-success border-success/20' },
};

interface CompareRow {
  label: string;
  icon: React.ReactNode;
  valueA: string | number;
  valueB: string | number;
  winner: 'a' | 'b' | 'tie';
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function buildRows(a: TopicAnalysis, b: TopicAnalysis): CompareRow[] {
  const numWinner = (va: number, vb: number, higherBetter = true) =>
    va === vb ? 'tie' as const : (higherBetter ? (va > vb ? 'a' : 'b') : (va < vb ? 'a' : 'b')) as 'a' | 'b';

  return [
    { label: 'Avg Accuracy', icon: <Target className="w-3.5 h-3.5" />, valueA: `${a.avgAccuracy}%`, valueB: `${b.avgAccuracy}%`, winner: numWinner(a.avgAccuracy, b.avgAccuracy) },
    { label: 'Best Score', icon: <Trophy className="w-3.5 h-3.5" />, valueA: `${a.bestAccuracy}%`, valueB: `${b.bestAccuracy}%`, winner: numWinner(a.bestAccuracy, b.bestAccuracy) },
    { label: 'Trend', icon: <TrendingUp className="w-3.5 h-3.5" />, valueA: `${a.trend >= 0 ? '+' : ''}${a.trend}%`, valueB: `${b.trend >= 0 ? '+' : ''}${b.trend}%`, winner: numWinner(a.trend, b.trend) },
    { label: 'Predicted', icon: <BarChart3 className="w-3.5 h-3.5" />, valueA: `${a.predictedNext}%`, valueB: `${b.predictedNext}%`, winner: numWinner(a.predictedNext, b.predictedNext) },
    { label: 'Consistency', icon: <Zap className="w-3.5 h-3.5" />, valueA: `${a.consistencyScore}%`, valueB: `${b.consistencyScore}%`, winner: numWinner(a.consistencyScore, b.consistencyScore) },
    { label: 'Improvement', icon: <TrendingUp className="w-3.5 h-3.5" />, valueA: `${a.improvementRate >= 0 ? '+' : ''}${a.improvementRate}%`, valueB: `${b.improvementRate >= 0 ? '+' : ''}${b.improvementRate}%`, winner: numWinner(a.improvementRate, b.improvementRate) },
    { label: 'Avg Time', icon: <Clock className="w-3.5 h-3.5" />, valueA: formatTime(a.avgTimeSpent), valueB: formatTime(b.avgTimeSpent), winner: numWinner(a.avgTimeSpent, b.avgTimeSpent, false) },
    { label: 'Attempts', icon: <Target className="w-3.5 h-3.5" />, valueA: `${a.totalAttempts}`, valueB: `${b.totalAttempts}`, winner: numWinner(a.totalAttempts, b.totalAttempts) },
  ];
}

function buildRadarData(a: TopicAnalysis, b: TopicAnalysis) {
  return [
    { metric: 'Accuracy', A: a.avgAccuracy, B: b.avgAccuracy },
    { metric: 'Consistency', A: a.consistencyScore, B: b.consistencyScore },
    { metric: 'Best Score', A: a.bestAccuracy, B: b.bestAccuracy },
    { metric: 'Predicted', A: a.predictedNext, B: b.predictedNext },
    { metric: 'Improvement', A: Math.max(0, a.improvementRate + 50), B: Math.max(0, b.improvementRate + 50) },
  ];
}

export function TopicComparisonView({ topics }: { topics: TopicAnalysis[] }) {
  const [topicAId, setTopicAId] = useState(topics[0]?.sheetId || '');
  const [topicBId, setTopicBId] = useState(topics[1]?.sheetId || topics[0]?.sheetId || '');

  const topicA = topics.find(t => t.sheetId === topicAId);
  const topicB = topics.find(t => t.sheetId === topicBId);

  if (topics.length < 2) {
    return (
      <Card className="modern-card">
        <CardContent className="p-8 text-center">
          <ArrowLeftRight className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Need at least 2 topics to compare</p>
        </CardContent>
      </Card>
    );
  }

  const rows = topicA && topicB ? buildRows(topicA, topicB) : [];
  const winsA = rows.filter(r => r.winner === 'a').length;
  const winsB = rows.filter(r => r.winner === 'b').length;
  const radarData = topicA && topicB && topicAId !== topicBId ? buildRadarData(topicA, topicB) : [];

  return (
    <Card className="modern-card overflow-hidden animate-slide-up">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-display flex items-center gap-2">
          <ArrowLeftRight className="w-5 h-5 text-primary" /> Compare Topics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selectors */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Topic A</label>
            <Select value={topicAId} onValueChange={setTopicAId}>
              <SelectTrigger className="rounded-xl h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {topics.map(t => <SelectItem key={t.sheetId} value={t.sheetId}>{t.sheetTitle}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Topic B</label>
            <Select value={topicBId} onValueChange={setTopicBId}>
              <SelectTrigger className="rounded-xl h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {topics.map(t => <SelectItem key={t.sheetId} value={t.sheetId}>{t.sheetTitle}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {topicA && topicB && topicAId !== topicBId && (
          <>
            {/* Score summary */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                <p className="text-2xl font-bold font-mono text-primary">{winsA}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Wins</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/50 flex items-center justify-center">
                <p className="text-lg font-bold font-mono text-muted-foreground">VS</p>
              </div>
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                <p className="text-2xl font-bold font-mono text-primary">{winsB}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Wins</p>
              </div>
            </div>

            {/* Mastery badges */}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <Badge variant="outline" className={`${masteryConfig[topicA.masteryLevel].color} text-xs`}>
                  {masteryConfig[topicA.masteryLevel].label}
                </Badge>
              </div>
              <div className="text-center">
                <Badge variant="outline" className={`${masteryConfig[topicB.masteryLevel].color} text-xs`}>
                  {masteryConfig[topicB.masteryLevel].label}
                </Badge>
              </div>
            </div>

            {/* Radar Chart */}
            <div className="pt-2">
              <p className="text-xs text-muted-foreground mb-2 font-medium">🕸️ Skills Radar</p>
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name={topicA.sheetTitle} dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                  <Radar name={topicB.sheetTitle} dataKey="B" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.15} strokeWidth={2} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Comparison rows */}
            <div className="space-y-1">
              {rows.map((row, i) => (
                <div key={i} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className={`text-right font-mono text-sm font-medium ${row.winner === 'a' ? 'text-success' : 'text-foreground'}`}>
                    {row.valueA} {row.winner === 'a' && <span className="text-success">✓</span>}
                  </div>
                  <div className="flex items-center gap-1.5 px-2 text-muted-foreground min-w-[100px] justify-center">
                    {row.icon}
                    <span className="text-[11px] whitespace-nowrap">{row.label}</span>
                  </div>
                  <div className={`text-left font-mono text-sm font-medium ${row.winner === 'b' ? 'text-success' : 'text-foreground'}`}>
                    {row.winner === 'b' && <span className="text-success">✓</span>} {row.valueB}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {topicAId === topicBId && (
          <div className="text-center py-6 text-muted-foreground text-sm">
            Select two different topics to compare
          </div>
        )}
      </CardContent>
    </Card>
  );
}
