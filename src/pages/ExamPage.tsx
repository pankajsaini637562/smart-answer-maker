import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Flag, Send, Clock, List, X, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { QuestionRow } from '@/components/QuestionRow';
import { Timer } from '@/components/Timer';
import { NavigationGrid } from '@/components/NavigationGrid';
import { AnswerKeyInput } from '@/components/AnswerKeyInput';
import { SEO } from '@/components/SEO';
import { getSheet, saveSheet, saveAttempt, getInProgressAttempt, generateId, saveResult } from '@/lib/storage';
import { OMRSheet, ExamAttempt, ExamResult, QuestionResult } from '@/types/exam';
import { toast } from 'sonner';

const OPTIONS_4 = ['A', 'B', 'C', 'D'];
const OPTIONS_5 = ['A', 'B', 'C', 'D', 'E'];

export default function ExamPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sheet, setSheet] = useState<OMRSheet | null>(null);
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [showAnswerKeyInput, setShowAnswerKeyInput] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    const loadedSheet = getSheet(id);
    if (!loadedSheet) {
      toast.error('Sheet not found');
      navigate('/');
      return;
    }
    setSheet(loadedSheet);

    // Check for in-progress attempt
    const existingAttempt = getInProgressAttempt(id);
    if (existingAttempt) {
      setAttempt(existingAttempt);
      setTimeSpent(existingAttempt.timeSpent);
    } else {
      // Create new attempt
      const newAttempt: ExamAttempt = {
        id: generateId(),
        sheetId: id,
        sheetTitle: loadedSheet.title,
        answers: Array(loadedSheet.totalQuestions).fill(null),
        markedForReview: Array(loadedSheet.totalQuestions).fill(false),
        questionTimes: Array(loadedSheet.totalQuestions).fill(0),
        startTime: new Date(),
        endTime: null,
        timeSpent: 0,
        score: null,
        correct: 0,
        wrong: 0,
        unattempted: loadedSheet.totalQuestions,
        accuracy: 0,
        status: 'in-progress',
      };
      setAttempt(newAttempt);
      saveAttempt(newAttempt);
    }
  }, [id, navigate]);

  // Keep latest values in refs so the auto-save interval doesn't need to be
  // torn down every second when timeSpent updates.
  const attemptRef = useRef(attempt);
  const timeSpentRef = useRef(timeSpent);
  useEffect(() => { attemptRef.current = attempt; }, [attempt]);
  useEffect(() => { timeSpentRef.current = timeSpent; }, [timeSpent]);

  // Auto-save every 5 seconds so elapsed time survives refresh/resume.
  useEffect(() => {
    if (!attempt) return;
    const interval = setInterval(() => {
      const current = attemptRef.current;
      if (!current || current.status !== 'in-progress') return;
      saveAttempt({ ...current, timeSpent: timeSpentRef.current });
    }, 5000);
    return () => clearInterval(interval);
    // Only re-run when the attempt identity changes (new exam started).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt?.id]);

  // Silent per-question timing: accumulate seconds against the currently
  // viewed question and flush when the student navigates away or submits.
  const questionEnterRef = useRef<number>(Date.now());
  const currentQuestionRef = useRef(currentQuestion);
  useEffect(() => { currentQuestionRef.current = currentQuestion; }, [currentQuestion]);

  const flushCurrentQuestionTime = useCallback(() => {
    const current = attemptRef.current;
    if (!current) return current;
    const now = Date.now();
    const delta = Math.max(0, Math.round((now - questionEnterRef.current) / 1000));
    questionEnterRef.current = now;
    if (!delta) return current;
    const times = [...(current.questionTimes || Array(current.answers.length).fill(0))];
    const idx = currentQuestionRef.current;
    times[idx] = (times[idx] || 0) + delta;
    const updated = { ...current, questionTimes: times };
    attemptRef.current = updated;
    setAttempt(updated);
    saveAttempt(updated);
    return updated;
  }, []);

  // Flush the running question timer whenever the user moves to a new question.
  useEffect(() => {
    questionEnterRef.current = Date.now();
    return () => { flushCurrentQuestionTime(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion]);

  // Persist elapsed time when the tab is hidden or unloaded.
  useEffect(() => {
    const persist = () => {
      const current = attemptRef.current;
      if (!current || current.status !== 'in-progress') return;
      flushCurrentQuestionTime();
      saveAttempt({ ...attemptRef.current!, timeSpent: timeSpentRef.current });
    };
    window.addEventListener('beforeunload', persist);
    document.addEventListener('visibilitychange', persist);
    return () => {
      window.removeEventListener('beforeunload', persist);
      document.removeEventListener('visibilitychange', persist);
    };
  }, [flushCurrentQuestionTime]);

  const handleSelectAnswer = useCallback((optionIndex: number) => {
    if (!attempt) return;

    const newAnswers = [...attempt.answers];
    // Toggle answer - if same option clicked, deselect
    newAnswers[currentQuestion] = newAnswers[currentQuestion] === optionIndex ? null : optionIndex;
    
    const updatedAttempt = { ...attempt, answers: newAnswers };
    setAttempt(updatedAttempt);
    saveAttempt(updatedAttempt);
  }, [attempt, currentQuestion]);

  const handleToggleReview = useCallback(() => {
    if (!attempt) return;

    const newReview = [...attempt.markedForReview];
    newReview[currentQuestion] = !newReview[currentQuestion];
    
    const updatedAttempt = { ...attempt, markedForReview: newReview };
    setAttempt(updatedAttempt);
    saveAttempt(updatedAttempt);
  }, [attempt, currentQuestion]);

  const handleTimeUp = useCallback(() => {
    toast.warning('Time is up! Submitting your exam...');
    initiateSubmit();
  }, []);

  const initiateSubmit = () => {
    if (!sheet?.answerKey) {
      setPendingSubmit(true);
      setShowAnswerKeyInput(true);
    } else {
      handleSubmit();
    }
  };

  const handleSaveAnswerKey = (answerKey: number[]) => {
    if (!sheet) return;
    
    const updatedSheet = { ...sheet, answerKey };
    saveSheet(updatedSheet);
    setSheet(updatedSheet);
    toast.success('Answer key saved!');
    
    if (pendingSubmit) {
      setPendingSubmit(false);
      // Small delay to ensure state is updated
      setTimeout(() => handleSubmitWithKey(answerKey), 100);
    }
  };

  const handleSubmitWithKey = (answerKey: number[]) => {
    if (!attempt || !sheet) return;

    // Flush any time still counting toward the current question before we score.
    const flushed = flushCurrentQuestionTime() || attempt;
    const times = flushed.questionTimes || Array(flushed.answers.length).fill(0);

    let correct = 0;
    let wrong = 0;
    let unattempted = 0;
    const questionResults: QuestionResult[] = [];

    flushed.answers.forEach((answer, index) => {
      const correctAnswer = answerKey[index];
      let isCorrect = false;
      let marksObtained = 0;

      if (answer === null) {
        unattempted++;
      } else {
        if (Array.isArray(correctAnswer)) {
          isCorrect = correctAnswer.includes(answer);
        } else {
          isCorrect = answer === correctAnswer;
        }

        if (isCorrect) {
          correct++;
          marksObtained = sheet.marksPerQuestion;
        } else {
          wrong++;
          marksObtained = -sheet.negativeMarking;
        }
      }

      questionResults.push({
        questionNumber: index + 1,
        userAnswer: answer,
        correctAnswer: correctAnswer ?? 0,
        isCorrect,
        marksObtained,
        timeSpent: times[index] || 0,
      });
    });

    const score = Math.max(0, correct * sheet.marksPerQuestion - wrong * sheet.negativeMarking);
    const maxScore = sheet.totalQuestions * sheet.marksPerQuestion;
    const accuracy = sheet.totalQuestions > 0 ? Math.round((correct / sheet.totalQuestions) * 100) : 0;

    const result: ExamResult = {
      attemptId: attempt.id,
      sheetId: sheet.id,
      sheetTitle: sheet.title,
      totalQuestions: sheet.totalQuestions,
      score,
      maxScore,
      correct,
      wrong,
      unattempted,
      accuracy,
      timeSpent,
      completedAt: new Date(),
      questionResults,
    };

    const completedAttempt: ExamAttempt = {
      ...attempt,
      endTime: new Date(),
      timeSpent,
      score,
      correct,
      wrong,
      unattempted,
      accuracy,
      status: 'completed',
    };

    saveAttempt(completedAttempt);
    saveResult(result);
    
    toast.success('Exam submitted successfully!');
    navigate(`/result/${attempt.id}`);
  };

  const handleSubmit = useCallback(() => {
    if (!attempt || !sheet) return;

    const answerKey = sheet.answerKey as number[];
    if (!answerKey) {
      setShowAnswerKeyInput(true);
      setPendingSubmit(true);
      return;
    }

    handleSubmitWithKey(answerKey);
  }, [attempt, sheet, timeSpent, navigate]);

  if (!sheet || !attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const options = sheet.optionsPerQuestion === 4 ? OPTIONS_4 : OPTIONS_5;
  const answeredCount = attempt.answers.filter(a => a !== null).length;
  const unansweredCount = sheet.totalQuestions - answeredCount;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO title="Take Exam | Smart AI OMR Analysis" description="Attempt your OMR exam with live timer and bubble selection." noindex />
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <X className="w-5 h-5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Exit Exam?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Your progress will be saved. You can continue later from where you left off.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => navigate('/')}>
                      Exit
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <div>
                <h1 className="font-semibold truncate max-w-[200px] md:max-w-none">{sheet.title}</h1>
                <p className="text-sm text-muted-foreground">
                  Q {currentQuestion + 1} of {sheet.totalQuestions}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {sheet.timeLimit > 0 ? (
                <Timer
                  initialSeconds={sheet.timeLimit * 60 - timeSpent}
                  isCountdown={true}
                  onTimeUp={handleTimeUp}
                  onTick={(s) => setTimeSpent(sheet.timeLimit * 60 - s)}
                />
              ) : (
                <Timer
                  initialSeconds={timeSpent}
                  onTick={setTimeSpent}
                />
              )}

              <Sheet open={isNavOpen} onOpenChange={setIsNavOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="relative">
                    <List className="w-5 h-5" />
                    {unansweredCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-warning text-warning-foreground text-xs rounded-full flex items-center justify-center">
                        {unansweredCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Question Navigator</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <NavigationGrid
                      totalQuestions={sheet.totalQuestions}
                      answers={attempt.answers}
                      markedForReview={attempt.markedForReview}
                      currentQuestion={currentQuestion}
                      onNavigate={(i) => {
                        setCurrentQuestion(i);
                        setIsNavOpen(false);
                      }}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container py-6">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Question {currentQuestion + 1}</CardTitle>
              <Button
                variant={attempt.markedForReview[currentQuestion] ? 'default' : 'outline'}
                size="sm"
                className="gap-2"
                onClick={handleToggleReview}
              >
                <Flag className="w-4 h-4" />
                {attempt.markedForReview[currentQuestion] ? 'Marked' : 'Mark for Review'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 py-4">
              <div className="question-number text-lg">{currentQuestion + 1}</div>
              <div className="flex items-center gap-3 flex-wrap">
                {options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectAnswer(index)}
                    className={`omr-bubble ${attempt.answers[currentQuestion] === index ? 'filled animate-fill' : ''}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-sm text-muted-foreground mt-4">
              {attempt.answers[currentQuestion] !== null 
                ? `Selected: ${options[attempt.answers[currentQuestion]!]}`
                : 'Click on an option to select your answer'
              }
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer Navigation */}
      <footer className="border-t bg-card sticky bottom-0">
        <div className="container py-4">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {currentQuestion === sheet.totalQuestions - 1 ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="gap-2">
                      <Send className="w-4 h-4" />
                      Submit Exam
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Submit Exam?</AlertDialogTitle>
                      <AlertDialogDescription>
                        You have answered {answeredCount} of {sheet.totalQuestions} questions.
                        {unansweredCount > 0 && ` ${unansweredCount} questions are unanswered.`}
                        <br /><br />
                        {!sheet.answerKey && (
                          <span className="text-primary font-medium">
                            You'll be asked to enter the answer key next to generate your report card.
                          </span>
                        )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Review Answers</AlertDialogCancel>
                      <AlertDialogAction onClick={initiateSubmit}>
                        {sheet.answerKey ? 'Submit' : 'Continue to Answer Key'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <Button
                  onClick={() => setCurrentQuestion(Math.min(sheet.totalQuestions - 1, currentQuestion + 1))}
                  className="gap-2"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* Answer Key Input Modal */}
      <AnswerKeyInput
        sheet={sheet}
        open={showAnswerKeyInput}
        onOpenChange={(open) => {
          setShowAnswerKeyInput(open);
          if (!open) setPendingSubmit(false);
        }}
        onSave={handleSaveAnswerKey}
      />
    </div>
  );
}
