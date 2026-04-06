import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, Scan, ArrowLeft, Check, Edit, RotateCcw, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AppHeader } from '@/components/AppHeader';
import { OMRBubble } from '@/components/OMRBubble';
import { AnswerKeyInput } from '@/components/AnswerKeyInput';
import { detectOMRBubbles, scoreDetectedAnswers, DetectedAnswer } from '@/lib/omrDetection';
import { getSheets, saveSheet, saveAttempt, saveResult, generateId } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { OMRSheet, ExamAttempt, ExamResult, QuestionResult } from '@/types/exam';
import { cn } from '@/lib/utils';

const OPTIONS_4 = ['A', 'B', 'C', 'D'];
const OPTIONS_5 = ['A', 'B', 'C', 'D', 'E'];

type Step = 'upload' | 'scanning' | 'review' | 'result';

export default function ScanOMRPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Config
  const [selectedSheetId, setSelectedSheetId] = useState<string>('');
  const [totalQuestions, setTotalQuestions] = useState(30);
  const [optionsPerQuestion, setOptionsPerQuestion] = useState<4 | 5>(4);

  // State
  const [step, setStep] = useState<Step>('upload');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [detectedAnswers, setDetectedAnswers] = useState<DetectedAnswer[]>([]);
  const [editedAnswers, setEditedAnswers] = useState<(number | null)[]>([]);
  const [processingTime, setProcessingTime] = useState(0);
  const [showAnswerKeyInput, setShowAnswerKeyInput] = useState(false);

  const sheets = getSheets();
  const selectedSheet = sheets.find(s => s.id === selectedSheetId);

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleScan = useCallback(async () => {
    if (!imageFile) return;

    setStep('scanning');

    try {
      const config = {
        totalQuestions: selectedSheet?.totalQuestions || totalQuestions,
        optionsPerQuestion: (selectedSheet?.optionsPerQuestion || optionsPerQuestion) as 4 | 5,
      };

      const result = await detectOMRBubbles(imageFile, config);
      setDetectedAnswers(result.answers);
      setEditedAnswers(result.answers.map(a => a.detectedOption));
      setProcessingTime(result.processingTimeMs);
      setStep('review');
      toast.success(`Scan complete! Processed in ${result.processingTimeMs}ms`);
    } catch (err) {
      console.error('OMR detection error:', err);
      toast.error('Failed to scan OMR sheet. Please try again.');
      setStep('upload');
    }
  }, [imageFile, selectedSheet, totalQuestions, optionsPerQuestion]);

  const handleEditAnswer = (questionIndex: number, optionIndex: number) => {
    setEditedAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[questionIndex] = newAnswers[questionIndex] === optionIndex ? null : optionIndex;
      return newAnswers;
    });
  };

  const handleSubmit = () => {
    const sheet = selectedSheet;
    if (!sheet?.answerKey) {
      setShowAnswerKeyInput(true);
      return;
    }
    processResults(sheet, sheet.answerKey as number[]);
  };

  const handleSaveAnswerKey = (answerKey: number[]) => {
    if (!selectedSheet) return;
    const updatedSheet = { ...selectedSheet, answerKey };
    saveSheet(updatedSheet);
    toast.success('Answer key saved!');
    processResults(updatedSheet, answerKey);
  };

  const processResults = (sheet: OMRSheet, answerKey: number[]) => {
    const scoring = scoreDetectedAnswers(
      editedAnswers.map((opt, i) => ({
        questionNumber: i + 1,
        detectedOption: opt,
        confidence: detectedAnswers[i]?.confidence || 1,
      })),
      answerKey,
      sheet.marksPerQuestion,
      sheet.negativeMarking
    );

    const attemptId = generateId();
    const questionResults: QuestionResult[] = editedAnswers.map((answer, index) => {
      const correctAnswer = answerKey[index];
      const isCorrect = answer !== null && (
        Array.isArray(correctAnswer) ? correctAnswer.includes(answer) : answer === correctAnswer
      );
      return {
        questionNumber: index + 1,
        userAnswer: answer,
        correctAnswer: correctAnswer ?? 0,
        isCorrect,
        marksObtained: answer === null ? 0 : isCorrect ? sheet.marksPerQuestion : -sheet.negativeMarking,
      };
    });

    const attempt: ExamAttempt = {
      id: attemptId,
      sheetId: sheet.id,
      sheetTitle: sheet.title,
      answers: editedAnswers,
      markedForReview: Array(editedAnswers.length).fill(false),
      startTime: new Date(),
      endTime: new Date(),
      timeSpent: 0,
      score: scoring.score,
      correct: scoring.correct,
      wrong: scoring.wrong,
      unattempted: scoring.unattempted,
      accuracy: scoring.accuracy,
      status: 'completed',
    };

    const result: ExamResult = {
      attemptId,
      sheetId: sheet.id,
      sheetTitle: sheet.title,
      totalQuestions: editedAnswers.length,
      score: scoring.score,
      maxScore: scoring.maxScore,
      correct: scoring.correct,
      wrong: scoring.wrong,
      unattempted: scoring.unattempted,
      accuracy: scoring.accuracy,
      timeSpent: 0,
      completedAt: new Date(),
      questionResults,
    };

    saveAttempt(attempt);
    saveResult(result);
    toast.success('OMR Sheet scored successfully!');
    navigate(`/result/${attemptId}`);
  };

  const handleReset = () => {
    setStep('upload');
    setImagePreview(null);
    setImageFile(null);
    setDetectedAnswers([]);
    setEditedAnswers([]);
  };

  const options = (selectedSheet?.optionsPerQuestion || optionsPerQuestion) === 4 ? OPTIONS_4 : OPTIONS_5;
  const qCount = selectedSheet?.totalQuestions || totalQuestions;
  const answeredCount = editedAnswers.filter(a => a !== null).length;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container py-6 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Scan OMR Sheet</h1>
            <p className="text-sm text-muted-foreground">Upload or capture your filled OMR sheet</p>
          </div>
        </div>

        {/* Step: Upload */}
        {step === 'upload' && (
          <div className="space-y-6">
            {/* Sheet selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">1. Select Sheet (Optional)</CardTitle>
                <CardDescription>Link to an existing sheet for answer key matching</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={selectedSheetId} onValueChange={setSelectedSheetId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a sheet or scan standalone" />
                  </SelectTrigger>
                  <SelectContent>
                    {sheets.map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.title} ({s.totalQuestions}Q, {s.subject})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {!selectedSheetId && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Total Questions</Label>
                      <Input
                        type="number"
                        min={1}
                        max={200}
                        value={totalQuestions}
                        onChange={e => setTotalQuestions(parseInt(e.target.value) || 30)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Options per Question</Label>
                      <Select value={String(optionsPerQuestion)} onValueChange={v => setOptionsPerQuestion(parseInt(v) as 4 | 5)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="4">4 (A-D)</SelectItem>
                          <SelectItem value="5">5 (A-E)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Image upload */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">2. Upload OMR Sheet Image</CardTitle>
                <CardDescription>Take a photo or upload an image of the filled OMR sheet</CardDescription>
              </CardHeader>
              <CardContent>
                {!imagePreview ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex flex-col items-center gap-3 p-8 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all"
                    >
                      <Camera className="w-10 h-10 text-primary" />
                      <span className="font-medium text-foreground">Take Photo</span>
                      <span className="text-sm text-muted-foreground">Use device camera</span>
                    </button>

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center gap-3 p-8 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all"
                    >
                      <Upload className="w-10 h-10 text-primary" />
                      <span className="font-medium text-foreground">Upload Image</span>
                      <span className="text-sm text-muted-foreground">JPG, PNG supported</span>
                    </button>

                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative rounded-xl overflow-hidden border bg-muted">
                      <img
                        src={imagePreview}
                        alt="OMR Sheet Preview"
                        className="w-full max-h-[400px] object-contain"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={handleReset} className="gap-2">
                        <RotateCcw className="w-4 h-4" />
                        Change Image
                      </Button>
                      <Button onClick={handleScan} className="gap-2 flex-1">
                        <Scan className="w-4 h-4" />
                        Scan & Detect Bubbles
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step: Scanning */}
        {step === 'scanning' && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-lg font-medium">Scanning OMR Sheet...</p>
              <p className="text-sm text-muted-foreground">Detecting filled bubbles using grid analysis</p>
            </CardContent>
          </Card>
        )}

        {/* Step: Review */}
        {step === 'review' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <CardTitle className="text-lg">Review Detected Answers</CardTitle>
                    <CardDescription>
                      {answeredCount}/{qCount} detected • Processed in {processingTime}ms • Click to edit
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
                      <RotateCcw className="w-4 h-4" />
                      Re-scan
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {editedAnswers.map((answer, qIndex) => {
                    const detected = detectedAnswers[qIndex];
                    const wasEdited = answer !== detected?.detectedOption;
                    return (
                      <div
                        key={qIndex}
                        className={cn(
                          'flex items-center gap-3 p-2 rounded-lg transition-colors',
                          wasEdited ? 'bg-warning/10' : 'hover:bg-muted/50'
                        )}
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary font-semibold flex items-center justify-center text-sm shrink-0">
                          {qIndex + 1}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {options.map((opt, optIndex) => (
                            <OMRBubble
                              key={optIndex}
                              option={opt}
                              selected={answer === optIndex}
                              onClick={() => handleEditAnswer(qIndex, optIndex)}
                            />
                          ))}
                        </div>
                        {detected && detected.confidence > 0 && (
                          <span className="text-xs text-muted-foreground ml-auto shrink-0">
                            {Math.round(detected.confidence * 100)}%
                          </span>
                        )}
                        {wasEdited && (
                          <Edit className="w-4 h-4 text-warning shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3 justify-end sticky bottom-4">
              {selectedSheet ? (
                <Button onClick={handleSubmit} size="lg" className="gap-2 shadow-lg">
                  <Send className="w-4 h-4" />
                  {selectedSheet.answerKey ? 'Score & Submit' : 'Enter Answer Key & Submit'}
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground bg-card p-3 rounded-lg border">
                  Select a sheet above to score your answers, or go back and link a sheet.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Answer Key Modal */}
        {selectedSheet && (
          <AnswerKeyInput
            sheet={selectedSheet}
            open={showAnswerKeyInput}
            onOpenChange={setShowAnswerKeyInput}
            onSave={handleSaveAnswerKey}
          />
        )}
      </main>
    </div>
  );
}
