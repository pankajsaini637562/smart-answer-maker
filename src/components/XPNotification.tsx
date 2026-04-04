import { Badge as BadgeType } from '@/lib/gamification';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Zap, ArrowUp, Trophy } from 'lucide-react';

interface XPNotificationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  xpEarned: number;
  xpBreakdown: { label: string; xp: number }[];
  newBadges: BadgeType[];
  leveledUp: boolean;
  newLevel?: number;
  xpProgress?: { current: number; needed: number; percent: number };
}

export function XPNotification({
  open, onOpenChange, xpEarned, xpBreakdown, newBadges, leveledUp, newLevel, xpProgress,
}: XPNotificationProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl font-display flex items-center justify-center gap-2">
            <Zap className="w-6 h-6 text-primary animate-pulse" />
            +{xpEarned} XP Earned!
          </DialogTitle>
          {leveledUp && newLevel && (
            <DialogDescription className="flex items-center justify-center gap-2 text-success font-semibold">
              <ArrowUp className="w-4 h-4" /> Level Up! You're now Level {newLevel}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* XP Breakdown */}
          <div className="space-y-1.5">
            {xpBreakdown.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm p-2 rounded-lg bg-accent/50">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-mono font-semibold text-primary">+{item.xp}</span>
              </div>
            ))}
          </div>

          {/* Progress to next level */}
          {xpProgress && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Level progress</span>
                <span>{xpProgress.current}/{xpProgress.needed} XP</span>
              </div>
              <Progress value={xpProgress.percent} className="h-2" />
            </div>
          )}

          {/* New badges */}
          {newBadges.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-warning" /> New Badges!
              </p>
              {newBadges.map(badge => (
                <div key={badge.id} className="flex items-center gap-3 p-3 rounded-xl bg-warning/5 border border-warning/20">
                  <span className="text-2xl">{badge.icon}</span>
                  <div>
                    <p className="font-semibold text-sm">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
