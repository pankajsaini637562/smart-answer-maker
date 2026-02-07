import { cn } from '@/lib/utils';

interface OMRBubbleProps {
  option: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
  state?: 'default' | 'correct' | 'wrong' | 'review';
}

export function OMRBubble({ option, selected, onClick, disabled = false, state = 'default' }: OMRBubbleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'omr-bubble',
        selected && state === 'default' && 'filled animate-fill',
        state === 'correct' && 'correct',
        state === 'wrong' && 'wrong',
        state === 'review' && 'review',
        disabled && 'cursor-not-allowed opacity-60'
      )}
    >
      {option}
    </button>
  );
}
