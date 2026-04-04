import { getGamificationState } from '@/lib/gamification';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

export function BadgesGrid() {
  const state = getGamificationState();
  const unlocked = state.badges.filter(b => b.unlockedAt);
  const locked = state.badges.filter(b => !b.unlockedAt);

  return (
    <Card className="modern-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-display flex items-center gap-2">
          <Trophy className="w-5 h-5 text-warning" />
          Badges ({unlocked.length}/{state.badges.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
          {unlocked.map(b => (
            <div key={b.id} className="flex flex-col items-center gap-1 p-2 rounded-xl bg-warning/5 border border-warning/20">
              <span className="text-2xl">{b.icon}</span>
              <p className="text-[10px] text-center font-medium leading-tight">{b.name}</p>
            </div>
          ))}
          {locked.map(b => (
            <div key={b.id} className="flex flex-col items-center gap-1 p-2 rounded-xl bg-muted/30 opacity-40">
              <span className="text-2xl grayscale">🔒</span>
              <p className="text-[10px] text-center text-muted-foreground leading-tight">{b.name}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
