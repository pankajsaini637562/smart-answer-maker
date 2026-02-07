import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { OMRSheet } from '@/types/exam';
import { cn } from '@/lib/utils';

interface AnswerKeyInputProps {
  sheet: OMRSheet;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (answerKey: number[]) => void;
}

const OPTIONS_4 = ['A', 'B', 'C', 'D'];
const OPTIONS_5 = ['A', 'B', 'C', 'D', 'E'];

export function AnswerKeyInput({ sheet, open, onOpenChange, onSave }: AnswerKeyInputProps) {
  const options = sheet.optionsPerQuestion === 4 ? OPTIONS_4 : OPTIONS_5;
  const [answers, setAnswers] = useState<(number | null)[]>(
    sheet.answerKey ? [...sheet.answerKey as number[]] : Array(sheet.totalQuestions).fill(null)
  );

  const handleSelect = (questionIndex: number, optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = newAnswers[questionIndex] === optionIndex ? null : optionIndex;
    setAnswers(newAnswers);
  };

  const handleSave = () => {
    const validAnswers = answers.map(a => a ?? 0);
    onSave(validAnswers);
    onOpenChange(false);
  };

  const filledCount = answers.filter(a => a !== null).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Enter Answer Key</DialogTitle>
          <DialogDescription>
            Select the correct answer for each question. {filledCount}/{sheet.totalQuestions} answers set.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[50vh] pr-4">
          <div className="space-y-3">
            {Array.from({ length: sheet.totalQuestions }, (_, qIndex) => (
              <div key={qIndex} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary font-semibold flex items-center justify-center text-sm shrink-0">
                  {qIndex + 1}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {options.map((option, optIndex) => (
                    <button
                      key={optIndex}
                      type="button"
                      onClick={() => handleSelect(qIndex, optIndex)}
                      className={cn(
                        'w-10 h-10 rounded-full border-2 font-medium text-sm transition-all',
                        answers[qIndex] === optIndex
                          ? 'bg-success text-success-foreground border-success'
                          : 'bg-muted border-border hover:border-primary hover:scale-105'
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {answers[qIndex] !== null && (
                  <Check className="w-5 h-5 text-success ml-auto" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Answer Key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
