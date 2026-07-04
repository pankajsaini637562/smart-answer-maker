import { useEffect, useState, useCallback } from 'react';
import { Crown, Flame, Sparkles, Trophy, Medal, Award, Loader2, RefreshCw } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { LEVEL_TITLES } from '@/lib/gamification';
import { SEO } from '@/components/SEO';
import { cn } from '@/lib/utils';

interface LeaderboardRow {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  class: string | null;
  country: string | null;
  xp: number;
  level: number;
  streak: number;
  updated_at: string;
}

const REFRESH_MS = 20_000;

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchLeaderboard = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    const { data, error } = await supabase.rpc('get_leaderboard', { _limit: 100 });
    if (!error && data) {
      setRows(data as LeaderboardRow[]);
      setLastUpdated(new Date());
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(() => fetchLeaderboard(true), REFRESH_MS);
    const onFocus = () => fetchLeaderboard(true);
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchLeaderboard]);

  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3);
  const myRank = user ? rows.findIndex(r => r.user_id === user.id) + 1 : 0;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Public Leaderboard | Smart AI OMR Analysis"
        description="See the top students ranked by XP earned from OMR practice exams. Updates automatically."
      />
      <AppHeader />
      <main className="container py-6 space-y-6 animate-fade-in">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl p-6 md:p-8" style={{ background: 'var(--gradient-primary)' }}>
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,white,transparent_60%)]" />
          <div className="relative flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1 text-primary-foreground">
              <h1 className="text-3xl md:text-4xl font-bold font-display flex items-center gap-2">
                <Crown className="w-8 h-8" /> Global Leaderboard
              </h1>
              <p className="text-primary-foreground/85 text-sm max-w-lg">
                Top students ranked by XP earned from OMR practice. Updates automatically every 20 seconds.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {myRank > 0 && (
                <Badge className="rounded-xl bg-white/20 text-primary-foreground border-white/30 backdrop-blur-sm">
                  Your rank: #{myRank}
                </Badge>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fetchLeaderboard()}
                disabled={refreshing}
                className="rounded-xl"
              >
                {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : rows.length === 0 ? (
          <Card className="modern-card p-10 text-center space-y-3">
            <Sparkles className="w-10 h-10 text-primary mx-auto" />
            <h2 className="text-xl font-semibold font-display">No rankings yet</h2>
            <p className="text-muted-foreground text-sm">Complete your first exam to earn XP and appear on the leaderboard!</p>
          </Card>
        ) : (
          <>
            {/* Podium */}
            {top3.length > 0 && (
              <div className="grid grid-cols-3 gap-3 md:gap-4 items-end">
                {[1, 0, 2].map((idx) => {
                  const row = top3[idx];
                  if (!row) return <div key={idx} />;
                  const rank = idx + 1;
                  const heightClass = rank === 1 ? 'md:pt-6' : rank === 2 ? 'md:pt-10' : 'md:pt-14';
                  const iconColor = rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-slate-300' : 'text-amber-600';
                  const IconEl = rank === 1 ? Crown : rank === 2 ? Trophy : Medal;
                  const isMe = user?.id === row.user_id;

                  return (
                    <div key={row.user_id} className={cn('flex flex-col items-center', heightClass)}>
                      <Card className={cn(
                        'modern-card w-full p-4 text-center space-y-3 relative overflow-hidden',
                        rank === 1 && 'ring-2 ring-yellow-400/50',
                        isMe && 'ring-2 ring-primary'
                      )}>
                        <div className={cn('absolute top-2 right-2', iconColor)}>
                          <IconEl className="w-5 h-5" />
                        </div>
                        <div className="flex justify-center">
                          <Avatar className={cn(
                            'border-2',
                            rank === 1 ? 'w-16 h-16 border-yellow-400' : 'w-14 h-14 border-border'
                          )}>
                            <AvatarImage src={row.avatar_url ?? undefined} />
                            <AvatarFallback className="text-lg font-bold">
                              {row.display_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-semibold text-sm truncate">{row.display_name}</p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {row.class || 'Student'}{row.country ? ` · ${row.country}` : ''}
                          </p>
                        </div>
                        <div className="pt-2 border-t border-border/50">
                          <p className="text-xl font-bold font-display gradient-text">{row.xp.toLocaleString()}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">XP · Lv {row.level}</p>
                        </div>
                      </Card>
                      <div className={cn(
                        'mt-2 w-full text-center py-1.5 rounded-b-xl text-xs font-bold text-primary-foreground',
                        rank === 1 && 'bg-yellow-500',
                        rank === 2 && 'bg-slate-400',
                        rank === 3 && 'bg-amber-600'
                      )}>
                        #{rank}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Rest of the list */}
            {rest.length > 0 && (
              <Card className="modern-card p-2 md:p-3 divide-y divide-border/50">
                {rest.map((row, i) => {
                  const rank = i + 4;
                  const isMe = user?.id === row.user_id;
                  return (
                    <div
                      key={row.user_id}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-xl transition-colors',
                        isMe && 'bg-primary/10'
                      )}
                    >
                      <div className="w-8 text-center text-sm font-bold text-muted-foreground font-mono">
                        {rank}
                      </div>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={row.avatar_url ?? undefined} />
                        <AvatarFallback>{row.display_name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">{row.display_name}</p>
                          {isMe && <Badge variant="secondary" className="text-[10px] h-4 px-1.5">You</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          Lv {row.level} · {LEVEL_TITLES[row.level] || 'Student'}
                          {row.class ? ` · ${row.class}` : ''}
                          {row.country ? ` · ${row.country}` : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">{row.xp.toLocaleString()} <span className="text-[10px] text-muted-foreground font-normal">XP</span></p>
                        {row.streak > 0 && (
                          <p className="text-[11px] text-orange-500 flex items-center justify-end gap-0.5">
                            <Flame className="w-3 h-3" /> {row.streak}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </Card>
            )}

            {lastUpdated && (
              <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                <Award className="w-3 h-3" />
                Updated {lastUpdated.toLocaleTimeString()} · auto-refreshes every 20s
              </p>
            )}
          </>
        )}
      </main>
    </div>
  );
}
