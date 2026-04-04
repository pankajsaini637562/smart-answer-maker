import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Brain, TrendingUp, Target, Lightbulb, Shield, Clock, Award, BookOpen, Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppHeader } from '@/components/AppHeader';
import { TopicAnalyticsCard } from '@/components/TopicAnalyticsCard';
import { TopicComparisonView } from '@/components/TopicComparisonView';
import { WeakTopicHeatmap } from '@/components/WeakTopicHeatmap';
import { AdaptiveInsights } from '@/components/AdaptiveInsights';
import { GamificationBar } from '@/components/GamificationBar';
import { BadgesGrid } from '@/components/BadgesGrid';
import { getResults } from '@/lib/storage';
import { analyzeByTopic } from '@/lib/analytics';
import { predictScore } from '@/lib/adaptiveEngine';
import { getGamificationState } from '@/lib/gamification';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from 'recharts';

function formatStudyTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function AnalyticsPage() {
  const results = getResults();
  const analysis = useMemo(() => analyzeByTopic(results), [results]);
  const gamState = getGamificationState();

  const sortedResults = useMemo(() => 
    [...results].sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()),
    [results]
  );

  const totals = useMemo(() => {
    const c = results.reduce((s, r) => s + r.correct, 0);
    const w = results.reduce((s, r) => s + r.wrong, 0);
    const u = results.reduce((s, r) => s + r.unattempted, 0);
    return [
      { name: 'Correct', value: c, color: 'hsl(var(--success))' },
      { name: 'Wrong', value: w, color: 'hsl(var(--destructive))' },
      { name: 'Unattempted', value: u, color: 'hsl(var(--muted-foreground))' },
    ];
  }, [results]);

  // Score predictions for each topic
  const predictions = useMemo(() => {
    if (!analysis) return [];
    return analysis.topicAnalyses.map(t => ({
      name: t.sheetTitle,
      ...predictScore(results, t.sheetTitle),
    }));
  }, [analysis, results]);

  if (!analysis) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="container py-16 text-center">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6 animate-float">
            <Brain className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display mb-2">No Data Yet</h2>
          <p className="text-muted-foreground mb-6">Complete some exams to unlock AI-powered analytics</p>
          <Link to="/create"><Button className="rounded-xl">Create Your First Sheet</Button></Link>
        </main>
      </div>
    );
  }

  const readinessColor = analysis.readiness >= 70 ? 'text-success' : analysis.readiness >= 40 ? 'text-warning' : 'text-destructive';
  const trendIcon = analysis.trend > 0 ? '↑' : analysis.trend < 0 ? '↓' : '→';
  const trendColor = analysis.trend > 0 ? 'text-success' : analysis.trend < 0 ? 'text-destructive' : 'text-muted-foreground';

  const overallTrendData = sortedResults.map((r, i) => ({
    exam: i + 1,
    accuracy: r.accuracy,
    score: Math.round((r.score / r.maxScore) * 100),
    name: r.sheetTitle.slice(0, 15),
  }));

  const subjectData = analysis.topicAnalyses.map(t => ({
    name: t.sheetTitle.length > 12 ? t.sheetTitle.slice(0, 12) + '…' : t.sheetTitle,
    accuracy: t.avgAccuracy,
    consistency: t.consistencyScore,
  }));

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 animate-fade-in">
          <Link to="/"><Button variant="ghost" size="icon" className="rounded-xl"><ArrowLeft className="w-5 h-5" /></Button></Link>
          <div>
            <h2 className="text-2xl font-bold font-display flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary" /> AI Analytics Engine
            </h2>
            <p className="text-muted-foreground text-sm">{analysis.totalExams} exams across {analysis.topicAnalyses.length} topic{analysis.topicAnalyses.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Gamification Bar */}
        {gamState.xp > 0 && <GamificationBar />}

        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-slide-up">
          <Card className="modern-card">
            <CardContent className="p-4 text-center space-y-1">
              <Shield className="w-5 h-5 mx-auto text-muted-foreground" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Readiness</p>
              <p className={`text-2xl font-bold font-mono ${readinessColor}`}>{analysis.readiness}%</p>
              <Progress value={analysis.readiness} className="h-1.5" />
            </CardContent>
          </Card>
          <Card className="modern-card">
            <CardContent className="p-4 text-center space-y-1">
              <Target className="w-5 h-5 mx-auto text-muted-foreground" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Accuracy</p>
              <p className="text-2xl font-bold font-mono text-primary">{analysis.avgAccuracy}%</p>
            </CardContent>
          </Card>
          <Card className="modern-card">
            <CardContent className="p-4 text-center space-y-1">
              <TrendingUp className="w-5 h-5 mx-auto text-muted-foreground" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Trend</p>
              <p className={`text-2xl font-bold font-mono ${trendColor}`}>{trendIcon} {Math.abs(analysis.trend)}%</p>
            </CardContent>
          </Card>
          <Card className="modern-card">
            <CardContent className="p-4 text-center space-y-1">
              <Clock className="w-5 h-5 mx-auto text-muted-foreground" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Study Time</p>
              <p className="text-2xl font-bold font-mono">{formatStudyTime(analysis.totalStudyTime)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Predicted Scores */}
        {predictions.length > 0 && (
          <Card className="modern-card animate-slide-up">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-primary" /> AI Score Predictions
              </CardTitle>
              <CardDescription>Based on your performance patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {predictions.map(p => (
                  <div key={p.name} className="p-3 rounded-xl bg-accent/30 space-y-2">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <div className="flex items-end gap-1">
                      <span className="text-2xl font-bold font-mono text-primary">{p.predicted}%</span>
                      <span className="text-xs text-muted-foreground mb-1">± {Math.round((p.range[1] - p.range[0]) / 2)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={p.confidence} className="h-1 flex-1" />
                      <span className="text-[10px] text-muted-foreground">{p.confidence}% confidence</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up stagger-2">
          {overallTrendData.length > 1 && (
            <Card className="modern-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-display flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" /> Overall Accuracy Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={overallTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradOverall" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis dataKey="exam" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }}
                      formatter={(value: number) => [`${value}%`, 'Accuracy']}
                      labelFormatter={(label) => `Exam #${label}`}
                    />
                    <Area type="monotone" dataKey="accuracy" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#gradOverall)" dot={{ r: 3, fill: 'hsl(var(--primary))' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <Card className="modern-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" /> Answer Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={totals} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" strokeWidth={0}>
                    {totals.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Weak Topic Heatmap */}
        {results.length > 0 && <WeakTopicHeatmap results={results} />}

        {/* Subject-wise Accuracy Bars */}
        {subjectData.length > 1 && (
          <Card className="modern-card animate-slide-up stagger-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" /> Subject-wise Accuracy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={Math.max(160, subjectData.length * 40)}>
                <LineChart data={subjectData} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={90} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(value: number, name: string) => [`${value}%`, name === 'accuracy' ? 'Accuracy' : 'Consistency']}
                  />
                  <Line type="monotone" dataKey="accuracy" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--primary))' }} />
                  <Line type="monotone" dataKey="consistency" stroke="hsl(var(--success))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--success))' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Strongest / Weakest */}
        {analysis.topicAnalyses.length > 1 && (
          <div className="grid grid-cols-2 gap-3 animate-slide-up stagger-2">
            {analysis.strongestTopic && (
              <Card className="modern-card border-success/20">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5 text-success" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Strongest</p>
                    <p className="font-medium text-sm truncate">{analysis.strongestTopic}</p>
                  </div>
                </CardContent>
              </Card>
            )}
            {analysis.weakestTopic && (
              <Card className="modern-card border-destructive/20">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-destructive" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Needs Work</p>
                    <p className="font-medium text-sm truncate">{analysis.weakestTopic}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Adaptive Insights + AI Coach */}
        <AdaptiveInsights results={results} />

        {/* Overall tips */}
        {analysis.overallTips.length > 0 && (
          <Card className="modern-card animate-slide-up stagger-3">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display flex items-center gap-2"><Lightbulb className="w-5 h-5 text-primary" /> AI Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {analysis.overallTips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-muted/50">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                    tip.priority === 'high' ? 'bg-destructive' : tip.priority === 'medium' ? 'bg-warning' : 'bg-success'
                  }`} />
                  <div>
                    <p className="font-medium text-sm">{tip.title}</p>
                    <p className="text-xs text-muted-foreground">{tip.description}</p>
                  </div>
                  <Badge variant={tip.priority === 'high' ? 'destructive' : 'secondary'} className="shrink-0 ml-auto text-[10px]">
                    {tip.priority}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Topic Comparison */}
        {analysis.topicAnalyses.length >= 2 && (
          <TopicComparisonView topics={analysis.topicAnalyses} />
        )}

        {/* Badges */}
        {gamState.badges.some(b => b.unlockedAt) && <BadgesGrid />}

        {/* Topic-wise Analysis */}
        <div className="space-y-3">
          <h3 className="section-title flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" /> Topic-wise Analysis
          </h3>

          {analysis.topicAnalyses.length > 3 ? (
            <Tabs defaultValue={analysis.topicAnalyses[0]?.sheetId} className="w-full">
              <TabsList className="w-full flex overflow-x-auto gap-1 h-auto p-1 bg-muted/50 rounded-xl">
                {analysis.topicAnalyses.map(t => (
                  <TabsTrigger key={t.sheetId} value={t.sheetId} className="text-xs rounded-lg px-3 py-2 truncate max-w-[120px]">
                    {t.sheetTitle}
                  </TabsTrigger>
                ))}
              </TabsList>
              {analysis.topicAnalyses.map(t => (
                <TabsContent key={t.sheetId} value={t.sheetId}>
                  <TopicAnalyticsCard topic={t} />
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="space-y-4">
              {analysis.topicAnalyses.map(t => (
                <TopicAnalyticsCard key={t.sheetId} topic={t} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
