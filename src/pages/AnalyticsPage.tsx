import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Brain, TrendingUp, Target, Lightbulb, Shield, Clock, Award, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppHeader } from '@/components/AppHeader';
import { TopicAnalyticsCard } from '@/components/TopicAnalyticsCard';
import { getResults } from '@/lib/storage';
import { analyzeByTopic } from '@/lib/analytics';

function formatStudyTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function AnalyticsPage() {
  const results = getResults();
  const analysis = useMemo(() => analyzeByTopic(results), [results]);

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

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 animate-fade-in">
          <Link to="/"><Button variant="ghost" size="icon" className="rounded-xl"><ArrowLeft className="w-5 h-5" /></Button></Link>
          <div>
            <h2 className="text-2xl font-bold font-display flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary" /> AI Analytics
            </h2>
            <p className="text-muted-foreground text-sm">{analysis.totalExams} exams across {analysis.topicAnalyses.length} topic{analysis.topicAnalyses.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

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

        {/* Strongest / Weakest topics */}
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
