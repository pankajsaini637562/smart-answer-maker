import { OMRBubble } from './OMRBubble';
import { Flag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuestionRowProps {
  questionNumber: number;
  options: string[];
  selectedAnswer: number | null;
  onSelectAnswer: (optionIndex: number) => void;
  isMarkedForReview?: boolean;
  onToggleReview?: () => void;
  disabled?: boolean;
  correctAnswer?: number | number[] | null;
  showResult?: boolean;
}

export function QuestionRow({
  questionNumber,
  options,
  selectedAnswer,
  onSelectAnswer,
  isMarkedForReview = false,
  onToggleReview,
  disabled = false,
  correctAnswer,
  showResult = false,
}: QuestionRowProps) {
  const getState = (optionIndex: number): 'default' | 'correct' | 'wrong' => {
    if (!showResult || correctAnswer === null || correctAnswer === undefined) return 'default';
    
    const isCorrectOption = Array.isArray(correctAnswer) 
      ? correctAnswer.includes(optionIndex) 
      : correctAnswer === optionIndex;
    
    if (isCorrectOption) return 'correct';
    if (selectedAnswer === optionIndex && !isCorrectOption) return 'wrong';
    return 'default';
  };

  return (
    <div className={cn(
      'question-row',
      isMarkedForReview && 'bg-warning/10 border-l-4 border-warning'
    )}>
      <div className="question-number">{questionNumber}</div>
      
      <div className="flex items-center gap-2 flex-1">
        {options.map((option, index) => (
          <OMRBubble
            key={index}
            option={option}
            selected={selectedAnswer === index}
            onClick={() => onSelectAnswer(index)}
            disabled={disabled}
            state={getState(index)}
          />
        ))}
      </div>

      {onToggleReview && (
        <button
          type="button"
          onClick={onToggleReview}
          className={cn(
            'p-2 rounded-lg transition-colors',
            isMarkedForReview 
              ? 'bg-warning text-warning-foreground' 
              : 'hover:bg-muted text-muted-foreground'
          )}
        >
          <Flag className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
