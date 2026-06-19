import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppHeader } from '@/components/AppHeader';
import { SEO } from '@/components/SEO';
import { saveSheet, generateId } from '@/lib/storage';
import { OMRSheet, SUBJECTS } from '@/types/exam';
import { toast } from 'sonner';

export default function CreateSheet() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [customSubject, setCustomSubject] = useState('');
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

    const finalSubject = subject === 'custom' ? customSubject.trim() : subject;

    const sheet: OMRSheet = {
      id: generateId(),
      title: title.trim(),
      subject: finalSubject || 'General',
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
      <SEO title="Create OMR Sheet | Smart AI OMR Analysis" description="Design a new OMR practice sheet with custom subjects, timing, and negative marking." />
      <AppHeader />
      <main>

      <div className="container py-6">
        <div className="flex items-center gap-3 mb-6 animate-fade-in">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold font-display">Create OMR Sheet</h2>
            <p className="text-sm text-muted-foreground">Design your custom exam sheet</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
          <Card className="modern-card animate-slide-up stagger-1">
            <CardHeader>
              <CardTitle className="font-display">Basic Information</CardTitle>
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
                  className="rounded-xl h-11"
                />
              </div>

              <div className="space-y-2">
                <Label>Subject / Topic</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger className="rounded-xl h-11">
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                    <SelectItem value="custom">✏️ Custom Subject</SelectItem>
                  </SelectContent>
                </Select>
                {subject === 'custom' && (
                  <Input
                    placeholder="Enter custom subject name"
                    value={customSubject}
                    onChange={e => setCustomSubject(e.target.value)}
                    className="rounded-xl h-11 animate-fade-in"
                  />
                )}
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
                  className="rounded-xl h-11"
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

          <Card className="modern-card animate-slide-up stagger-2">
            <CardHeader>
              <CardTitle className="font-display">Scoring</CardTitle>
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
                  className="rounded-xl h-11"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-accent/50">
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
                    className="rounded-xl h-11"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="modern-card animate-slide-up stagger-3">
            <CardHeader>
              <CardTitle className="font-display">Timer</CardTitle>
              <CardDescription>Set a time limit for the exam</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-accent/50">
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
                    className="rounded-xl h-11"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-4 animate-slide-up stagger-4">
            <Link to="/" className="flex-1">
              <Button type="button" variant="outline" className="w-full rounded-xl h-12">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="flex-1 gap-2 rounded-xl h-12 shadow-lg shadow-primary/20">
              <Sparkles className="w-4 h-4" />
              Create Sheet
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
