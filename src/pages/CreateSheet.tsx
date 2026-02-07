import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { saveSheet, generateId } from '@/lib/storage';
import { OMRSheet } from '@/types/exam';
import { toast } from 'sonner';

export default function CreateSheet() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [totalQuestions, setTotalQuestions] = useState(30);
  const [optionsPerQuestion, setOptionsPerQuestion] = useState<4 | 5>(4);
  const [hasTimeLimit, setHasTimeLimit] = useState(true);
  const [timeLimit, setTimeLimit] = useState(30);
  const [hasNegativeMarking, setHasNegativeMarking] = useState(false);
  const [negativeMarking, setNegativeMarking] = useState(0.25);
  const [marksPerQuestion, setMarksPerQuestion] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (totalQuestions < 1 || totalQuestions > 200) {
      toast.error('Questions must be between 1 and 200');
      return;
    }

    const sheet: OMRSheet = {
      id: generateId(),
      title: title.trim(),
      totalQuestions,
      optionsPerQuestion,
      timeLimit: hasTimeLimit ? timeLimit : 0,
      negativeMarking: hasNegativeMarking ? negativeMarking : 0,
      marksPerQuestion,
      answerKey: null,
      createdAt: new Date(),
    };

    saveSheet(sheet);
    toast.success('OMR Sheet created!');
    navigate(`/exam/${sheet.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold">Create OMR Sheet</h1>
              <p className="text-sm text-muted-foreground">Design your custom exam sheet</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Set up the basic details of your OMR sheet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Sheet Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Physics Chapter 5 Test"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="questions">Number of Questions</Label>
                <Input
                  id="questions"
                  type="number"
                  min={1}
                  max={200}
                  value={totalQuestions}
                  onChange={(e) => setTotalQuestions(parseInt(e.target.value) || 1)}
                />
              </div>

              <div className="space-y-3">
                <Label>Options per Question</Label>
                <RadioGroup
                  value={String(optionsPerQuestion)}
                  onValueChange={(v) => setOptionsPerQuestion(parseInt(v) as 4 | 5)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="4" id="opt4" />
                    <Label htmlFor="opt4" className="font-normal">4 Options (A-D)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="5" id="opt5" />
                    <Label htmlFor="opt5" className="font-normal">5 Options (A-E)</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Scoring */}
          <Card>
            <CardHeader>
              <CardTitle>Scoring</CardTitle>
              <CardDescription>Configure marks and negative marking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="marks">Marks per Question</Label>
                <Input
                  id="marks"
                  type="number"
                  min={1}
                  max={10}
                  value={marksPerQuestion}
                  onChange={(e) => setMarksPerQuestion(parseInt(e.target.value) || 1)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Negative Marking</Label>
                  <p className="text-sm text-muted-foreground">Deduct marks for wrong answers</p>
                </div>
                <Switch
                  checked={hasNegativeMarking}
                  onCheckedChange={setHasNegativeMarking}
                />
              </div>

              {hasNegativeMarking && (
                <div className="space-y-2 animate-fade-in">
                  <Label htmlFor="negative">Marks Deducted per Wrong Answer</Label>
                  <Input
                    id="negative"
                    type="number"
                    step="0.25"
                    min={0}
                    max={marksPerQuestion}
                    value={negativeMarking}
                    onChange={(e) => setNegativeMarking(parseFloat(e.target.value) || 0)}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timer */}
          <Card>
            <CardHeader>
              <CardTitle>Timer</CardTitle>
              <CardDescription>Set a time limit for the exam</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Timer</Label>
                  <p className="text-sm text-muted-foreground">Add a countdown timer</p>
                </div>
                <Switch
                  checked={hasTimeLimit}
                  onCheckedChange={setHasTimeLimit}
                />
              </div>

              {hasTimeLimit && (
                <div className="space-y-2 animate-fade-in">
                  <Label htmlFor="time">Time Limit (minutes)</Label>
                  <Input
                    id="time"
                    type="number"
                    min={1}
                    max={300}
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(parseInt(e.target.value) || 1)}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Link to="/" className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="flex-1 gap-2">
              <Save className="w-4 h-4" />
              Create Sheet
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
