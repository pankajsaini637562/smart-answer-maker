import { Link } from 'react-router-dom';
import { Plus, FileText, Trophy, Clock, Target, TrendingUp, ArrowRight, Sparkles, Brain, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/StatCard';
import { AppHeader } from '@/components/AppHeader';
import { GamificationBar } from '@/components/GamificationBar';
import { BadgesGrid } from '@/components/BadgesGrid';
import { getSheets, getScoreboard, getResults } from '@/lib/storage';
import { refreshStreak, getGamificationState } from '@/lib/gamification';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AdSlot } from '@/components/AdSlot';
export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ display_name: string; class: string } | null>(null);
  const sheets = getSheets();
  const scoreboard = getScoreboard().slice(0, 5);
  const results = getResults();

  useEffect(() => { refreshStreak(); }, []);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('display_name, class').eq('id', user.id).single()
      .then(({ data }) => { if (data) setProfile(data as any); });
  }, [user]);

  const gamState = getGamificationState();
  const totalExams = results.length;
  const avgAccuracy = results.length > 0 
    ? Math.round(results.reduce((sum, r) => sum + r.accuracy, 0) / results.length) 
    : 0;
  const totalTime = results.reduce((sum, r) => sum + r.timeSpent, 0);
  const formatTotalTime = () => {
    const hours = Math.floor(totalTime / 3600);
    const minutes = Math.floor((totalTime % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0" style={{ background: 'var(--gradient-hero)' }} />
        <div className="container relative py-8 md:py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                AI-Powered Smart Learning
              </div>
              <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight">
                {profile?.display_name ? `Hey ${profile.display_name} 👋` : 'Master your exams'}
              </h2>
              <p className="text-muted-foreground max-w-md">
                {profile?.class
                  ? <><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent text-accent-foreground text-xs font-semibold mr-1">Class {profile.class}</span> Adaptive learning &amp; AI analytics to boost your scores.</>
                  : 'Adaptive learning, AI analytics, and gamified practice to boost your scores.'}
              </p>
            </div>
            <div className="flex gap-3 animate-scale-in">
              <Link to="/create">
                <Button size="lg" className="gap-2 rounded-xl px-6 h-12 text-base shadow-lg shadow-primary/20">
                  <Plus className="w-5 h-5" />
                  New OMR Sheet
                </Button>
              </Link>
            </div>
          </div>

          {/* Gamification Bar */}
          {gamState.xp > 0 && (
            <div className="mt-6 animate-slide-up">
              <GamificationBar />
            </div>
          )}
        </div>
      </section>

      <main className="container py-8 space-y-10">
        {/* Header Ad */}
        <AdSlot slot="1111111111" format="horizontal" minHeight={90} />

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { title: 'Total Exams', value: totalExams, icon: FileText, variant: 'default' as const, delay: 'stagger-1' },
            { title: 'Avg Accuracy', value: `${avgAccuracy}%`, icon: Target, variant: (avgAccuracy >= 70 ? 'success' : avgAccuracy >= 50 ? 'warning' : 'destructive') as 'success' | 'warning' | 'destructive', delay: 'stagger-2' },
            { title: 'Practice Time', value: formatTotalTime(), icon: Clock, variant: 'default' as const, delay: 'stagger-3' },
            { title: 'Day Streak', value: gamState.streak > 0 ? `${gamState.streak} 🔥` : '0', icon: Flame, variant: (gamState.streak >= 7 ? 'success' : gamState.streak >= 3 ? 'warning' : 'default') as any, delay: 'stagger-4' },
          ].map((stat) => (
            <div key={stat.title} className={`animate-slide-up ${stat.delay}`}>
              <StatCard {...stat} />
            </div>
          ))}
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="section-title mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { to: '/create', icon: Plus, title: 'Create OMR Sheet', desc: 'Design a new exam sheet', color: 'primary' },
              { to: '/sheets', icon: FileText, title: 'My Sheets', desc: 'View saved OMR sheets', color: 'primary' },
              { to: '/history', icon: Trophy, title: 'Results', desc: 'Past exam results', color: 'primary' },
              { to: '/analytics', icon: Brain, title: 'AI Analytics', desc: 'Smart performance insights', color: 'primary' },
            ].map((action) => (
              <Link key={action.to} to={action.to} className="block group">
                <Card className="h-full modern-card cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                      <action.icon className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <CardTitle className="text-lg font-display flex items-center justify-between">
                      {action.title}
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </CardTitle>
                    <CardDescription>{action.desc}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* In-feed Ad */}
        <AdSlot slot="2222222222" format="fluid" layoutKey="-gw-3+1f-3d+2z" minHeight={120} />

        {/* Badges */}

        {gamState.badges.some(b => b.unlockedAt) && (
          <section className="animate-slide-up stagger-2">
            <BadgesGrid />
          </section>
        )}

        {/* Recent Scores */}
        {scoreboard.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Recent Scores</h2>
              <Link to="/history" className="text-sm text-primary hover:underline font-medium">View all →</Link>
            </div>
            <Card className="modern-card overflow-hidden">
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {scoreboard.map((entry, index) => (
                    <div key={entry.id} className="flex items-center justify-between p-4 hover:bg-accent/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-sm font-bold text-accent-foreground font-mono">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{entry.sheetTitle}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(entry.completedAt, { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold font-mono">{entry.score}/{entry.maxScore}</p>
                        <p className="text-xs text-muted-foreground">{entry.accuracy}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Recent Sheets */}
        {sheets.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Recent Sheets</h2>
              <Link to="/sheets" className="text-sm text-primary hover:underline font-medium">View all →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sheets.slice(0, 3).map((sheet) => (
                <Link key={sheet.id} to={`/exam/${sheet.id}`}>
                  <Card className="modern-card cursor-pointer">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-display">{sheet.title}</CardTitle>
                      <CardDescription>
                        {sheet.totalQuestions} questions • {sheet.optionsPerQuestion} options
                        {sheet.timeLimit > 0 && ` • ${sheet.timeLimit} min`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground text-xs">
                          {formatDistanceToNow(sheet.createdAt, { addSuffix: true })}
                        </span>
                        <span className="text-primary font-medium text-sm flex items-center gap-1">
                          Start <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {sheets.length === 0 && (
          <section className="text-center py-20">
            <div className="w-20 h-20 rounded-3xl bg-accent flex items-center justify-center mx-auto mb-6 animate-float">
              <FileText className="w-10 h-10 text-accent-foreground" />
            </div>
            <h2 className="text-2xl font-bold font-display mb-2">No OMR Sheets Yet</h2>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              Create your first OMR sheet to start practicing for exams
            </p>
            <Link to="/create">
              <Button size="lg" className="gap-2 rounded-xl px-8 h-12 shadow-lg shadow-primary/20">
                <Plus className="w-5 h-5" /> Create Your First Sheet
              </Button>
            </Link>
          </section>
        )}
      </main>
    </div>
  );
}
