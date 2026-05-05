import { cn } from '@/lib/utils';

interface OMRBubbleProps {
  option: string;
  selected?: boolean;
  state?: 'default' | 'correct' | 'wrong';
  disabled?: boolean;
  onClick?: () => void;
}

export function OMRBubble({ option, selected = false, state = 'default', disabled = false, onClick }: OMRBubbleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-all',
        'disabled:cursor-not-allowed',
        state === 'correct' && 'border-success bg-success text-success-foreground',
        state === 'wrong' && 'border-destructive bg-destructive text-destructive-foreground',
        state === 'default' && selected && 'border-primary bg-primary text-primary-foreground',
        state === 'default' && !selected && 'border-border bg-background text-foreground hover:border-primary/50'
      )}
      aria-pressed={selected}
      aria-label={`Option ${option}`}
    >
      {option}
    </button>
  );
}
