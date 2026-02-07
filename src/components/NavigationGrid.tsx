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
      'w-10 h-10 rounded-lg font-medium text-sm transition-all',
      isCurrent && 'ring-2 ring-primary ring-offset-2',
      isAnswered && !isReview && 'bg-success text-success-foreground',
      isReview && 'bg-warning text-warning-foreground',
      !isAnswered && !isReview && 'bg-muted text-muted-foreground hover:bg-muted/80'
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

      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-success" />
          <span>Answered ({answered})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-muted" />
          <span>Unanswered ({unanswered})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-warning" />
          <span>For Review ({reviewCount})</span>
        </div>
      </div>
    </div>
  );
}
