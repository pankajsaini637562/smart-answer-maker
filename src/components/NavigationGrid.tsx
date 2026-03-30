import { cn } from '@/lib/utils';

interface NavigationGridProps {
  totalQuestions: number;
  answers: (number | null)[];
  markedForReview: boolean[];
  currentQuestion: number;
  onNavigate: (questionIndex: number) => void;
}

export function NavigationGrid({
  totalQuestions,
  answers,
  markedForReview,
  currentQuestion,
  onNavigate,
}: NavigationGridProps) {
  const getButtonClass = (index: number) => {
    const isAnswered = answers[index] !== null;
    const isReview = markedForReview[index];
    const isCurrent = currentQuestion === index;

    return cn(
      'w-10 h-10 rounded-xl font-medium text-sm transition-all duration-200 font-mono',
      isCurrent && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
      isAnswered && !isReview && 'bg-success text-success-foreground shadow-sm',
      isReview && 'bg-warning text-warning-foreground shadow-sm',
      !isAnswered && !isReview && 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
    );
  };

  const answered = answers.filter(a => a !== null).length;
  const unanswered = totalQuestions - answered;
  const reviewCount = markedForReview.filter(r => r).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: totalQuestions }, (_, i) => (
          <button
            key={i}
            onClick={() => onNavigate(i)}
            className={getButtonClass(i)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 text-xs font-medium">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-md bg-success shadow-sm" />
          <span className="text-muted-foreground">Answered ({answered})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-md bg-muted border border-border" />
          <span className="text-muted-foreground">Unanswered ({unanswered})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-md bg-warning shadow-sm" />
          <span className="text-muted-foreground">Review ({reviewCount})</span>
        </div>
      </div>
    </div>
  );
}
