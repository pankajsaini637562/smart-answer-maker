import { useEffect, useState, useCallback } from 'react';
import { Clock, Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimerProps {
  initialSeconds: number;
  isCountdown?: boolean;
  onTimeUp?: () => void;
  onTick?: (seconds: number) => void;
  isPaused?: boolean;
}

export function Timer({ 
  initialSeconds, 
  isCountdown = false, 
  onTimeUp, 
  onTick,
  isPaused = false 
}: TimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setSeconds(prev => {
        const next = isCountdown ? prev - 1 : prev + 1;
        
        if (isCountdown && next <= 0) {
          clearInterval(interval);
          onTimeUp?.();
          return 0;
        }
        
        onTick?.(next);
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isCountdown, isPaused, onTimeUp, onTick]);

  const formatTime = useCallback((totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const getTimerClass = () => {
    if (!isCountdown) return '';
    if (seconds <= 60) return 'timer-danger';
    if (seconds <= 300) return 'timer-warning';
    return '';
  };

  return (
    <div className={cn('flex items-center gap-2 timer-display', getTimerClass())}>
      <Clock className="w-5 h-5" />
      <span>{formatTime(seconds)}</span>
      {isPaused && <Pause className="w-4 h-4 text-muted-foreground" />}
    </div>
  );
}
