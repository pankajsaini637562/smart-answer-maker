import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Trophy, Target, Clock, XCircle, CheckCircle, MinusCircle, Share2, RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { StatCard } from '@/components/StatCard';
import { QuestionRow } from '@/components/QuestionRow';
import { getResult, getSheet } from '@/lib/storage';
import { toast } from 'sonner';

const OPTIONS_4 = ['A', 'B', 'C', 'D'];
const OPTIONS_5 = ['A', 'B', 'C', 'D', 'E'];

export default function ResultPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  
  const result = attemptId ? getResult(attemptId) : null;
  const sheet = result ? getSheet(result.sheetId) : null;

  if (!result || !sheet) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground">Result not found</p>
        <Link to="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    );
  }

  const options = sheet.optionsPerQuestion === 4 ? OPTIONS_4 : OPTIONS_5;
  const percentage = Math.round((result.score / result.maxScore) * 100);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getGrade = () => {
    if (percentage >= 90) return { grade: 'A+', color: 'text-success' };
    if (percentage >= 80) return { grade: 'A', color: 'text-success' };
    if (percentage >= 70) return { grade: 'B', color: 'text-primary' };
    if (percentage >= 60) return { grade: 'C', color: 'text-warning' };
    if (percentage >= 50) return { grade: 'D', color: 'text-warning' };
    return { grade: 'F', color: 'text-destructive' };
  };

  const { grade, color } = getGrade();

  const handleShare = () => {
    const text = `🎯 Exam Master Result\n\n📝 ${result.sheetTitle}\n✅ Score: ${result.score}/${result.maxScore} (${result.accuracy}%)\n⏱️ Time: ${formatTime(result.timeSpent)}\n\n✓ Correct: ${result.correct}\n✗ Wrong: ${result.wrong}\n○ Unattempted: ${result.unattempted}`;
    
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Result copied to clipboard!');
    }
  };

  const handleRetry = () => {
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
              <h1 className="text-xl font-semibold">Exam Results</h1>
              <p className="text-sm text-muted-foreground">{result.sheetTitle}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        {/* Score Overview */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-card shadow-lg mb-4">
                <Trophy className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-4xl font-bold mb-2">
                {result.score}<span className="text-muted-foreground text-2xl">/{result.maxScore}</span>
              </h2>
              <p className={`text-2xl font-bold ${color}`}>Grade: {grade}</p>
              <p className="text-muted-foreground mt-2">
                Completed on {result.completedAt.toLocaleDateString()} at {result.completedAt.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Accuracy"
            value={`${result.accuracy}%`}
            icon={Target}
            variant={result.accuracy >= 70 ? 'success' : result.accuracy >= 50 ? 'warning' : 'destructive'}
          />
          <StatCard
            title="Correct"
            value={result.correct}
            icon={CheckCircle}
            variant="success"
          />
          <StatCard
            title="Wrong"
            value={result.wrong}
            icon={XCircle}
            variant="destructive"
          />
          <StatCard
            title="Time Taken"
            value={formatTime(result.timeSpent)}
            icon={Clock}
          />
        </div>

        {/* Progress Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Correct Answers</span>
                <span className="text-success">{result.correct} ({Math.round((result.correct / result.totalQuestions) * 100)}%)</span>
              </div>
              <Progress value={(result.correct / result.totalQuestions) * 100} className="h-3 bg-success/20" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Wrong Answers</span>
                <span className="text-destructive">{result.wrong} ({Math.round((result.wrong / result.totalQuestions) * 100)}%)</span>
              </div>
              <Progress value={(result.wrong / result.totalQuestions) * 100} className="h-3 bg-destructive/20" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Unattempted</span>
                <span className="text-muted-foreground">{result.unattempted} ({Math.round((result.unattempted / result.totalQuestions) * 100)}%)</span>
              </div>
              <Progress value={(result.unattempted / result.totalQuestions) * 100} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Question-wise Review */}
        {sheet.answerKey && (
          <Card>
            <CardHeader>
              <CardTitle>Question-wise Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {result.questionResults.map((qr, index) => (
                  <QuestionRow
                    key={index}
                    questionNumber={qr.questionNumber}
                    options={options}
                    selectedAnswer={qr.userAnswer}
                    onSelectAnswer={() => {}}
                    disabled={true}
                    correctAnswer={qr.correctAnswer}
                    showResult={true}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button variant="outline" className="gap-2" onClick={handleShare}>
            <Share2 className="w-4 h-4" />
            Share Result
          </Button>
          <Button variant="outline" className="gap-2" onClick={handleRetry}>
            <RotateCcw className="w-4 h-4" />
            Retry Exam
          </Button>
          <Link to="/">
            <Button className="gap-2">
              <Home className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
