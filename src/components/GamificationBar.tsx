import { getGamificationState, getLevelFromXP, getXPProgress, LEVEL_TITLES } from '@/lib/gamification';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Flame, Star, Trophy, Zap } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function GamificationBar() {
  const state = getGamificationState();
  const level = getLevelFromXP(state.xp);
  const progress = getXPProgress(state.xp);
  const title = LEVEL_TITLES[level] || 'Transcendent';

  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-accent/50 border border-border/50">
      {/* Level */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Star className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground leading-none">Lv.{level}</p>
              <p className="text-xs font-semibold truncate">{title}</p>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent><p>{state.xp} XP total</p></TooltipContent>
      </Tooltip>

      {/* XP Progress */}
      <div className="flex-1 min-w-0 hidden sm:block">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-0.5">
          <span className="flex items-center gap-1"><Zap className="w-3 h-3" />{progress.current} XP</span>
          <span>{progress.needed} XP</span>
        </div>
        <Progress value={progress.percent} className="h-1.5" />
      </div>

      {/* Streak */}
      {state.streak > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="shrink-0 gap-1 bg-warning/10 text-warning border-warning/20">
              <Flame className="w-3 h-3" />
              {state.streak}
            </Badge>
          </TooltipTrigger>
          <TooltipContent><p>{state.streak} day streak! Best: {state.longestStreak}</p></TooltipContent>
        </Tooltip>
      )}

      {/* Badge count */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="shrink-0 gap-1">
            <Trophy className="w-3 h-3" />
            {state.badges.filter(b => b.unlockedAt).length}
          </Badge>
        </TooltipTrigger>
        <TooltipContent><p>{state.badges.filter(b => b.unlockedAt).length} / {state.badges.length} badges</p></TooltipContent>
      </Tooltip>
    </div>
  );
}
