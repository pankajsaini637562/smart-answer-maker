import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Trash2, Eye, Clock, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { AppHeader } from '@/components/AppHeader';
import { AdSlot } from '@/components/AdSlot';
import { getResults, deleteResult, getScoreboard, clearScoreboard } from '@/lib/storage';
import { ExamResult, ScoreboardEntry } from '@/types/exam';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export default function HistoryPage() {
  const [results, setResults] = useState<ExamResult[]>(getResults());
  const [scoreboard, setScoreboard] = useState<ScoreboardEntry[]>(getScoreboard());
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [clearAll, setClearAll] = useState(false);

  const handleDelete = (attemptId: string) => {
    deleteResult(attemptId);
    setResults(getResults());
    setDeleteId(null);
    toast.success('Result deleted');
  };

  const handleClearScoreboard = () => {
    clearScoreboard();
    setScoreboard([]);
    setClearAll(false);
    toast.success('Scoreboard cleared');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const medalColors = [
    'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
    'bg-muted text-muted-foreground border-border',
    'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  ];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <div className="container py-6 space-y-8">
        <AdSlot slot="3333333333" format="horizontal" minHeight={90} />
        <div className="animate-fade-in">
          <h2 className="text-2xl font-bold font-display">Results History</h2>
          <p className="text-sm text-muted-foreground">{results.length} exams completed</p>
        </div>

        {/* Scoreboard */}
        {scoreboard.length > 0 && (
          <section className="animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title flex items-center gap-2">
                <Trophy className="w-5 h-5 text-warning" />
                Scoreboard
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setClearAll(true)} className="rounded-lg text-xs">
                Clear
              </Button>
            </div>
            <Card className="modern-card overflow-hidden">
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {scoreboard.slice(0, 5).map((entry, index) => (
                    <div key={entry.id} className="flex items-center justify-between p-4 hover:bg-accent/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center text-xs font-bold font-mono ${medalColors[index] || 'bg-muted text-muted-foreground border-border'}`}>
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{entry.sheetTitle}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(entry.completedAt, { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold font-mono">{entry.score}/{entry.maxScore}</p>
                        <p className="text-xs text-muted-foreground">{entry.accuracy}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* All Results */}
        <section>
          <h3 className="section-title mb-4">All Results</h3>
          {results.length === 0 ? (
            <div className="text-center py-20 animate-fade-in">
              <div className="w-20 h-20 rounded-3xl bg-accent flex items-center justify-center mx-auto mb-6 animate-float">
                <Trophy className="w-10 h-10 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-bold font-display mb-2">No Results Yet</h3>
              <p className="text-muted-foreground mb-6">Complete an exam to see your results here</p>
              <Link to="/"><Button className="rounded-xl">Go to Dashboard</Button></Link>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((result, i) => (
                <Card key={result.attemptId} className="modern-card animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">{result.sheetTitle}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {result.completedAt.toLocaleDateString()} • {result.completedAt.toLocaleTimeString()}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <Badge variant="secondary" className="rounded-lg gap-1 font-normal">
                            <Target className="w-3 h-3" />
                            {result.accuracy}%
                          </Badge>
                          <Badge variant="secondary" className="rounded-lg gap-1 font-normal">
                            <Clock className="w-3 h-3" />
                            {formatTime(result.timeSpent)}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right mr-2">
                          <p className="text-2xl font-bold font-mono">{result.score}</p>
                          <p className="text-xs text-muted-foreground">/{result.maxScore}</p>
                        </div>
                        <Link to={`/result/${result.attemptId}`}>
                          <Button variant="ghost" size="icon" className="rounded-xl">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setDeleteId(result.attemptId)}
                          className="rounded-xl"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Delete Result?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete this exam result.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={clearAll} onOpenChange={setClearAll}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Clear Scoreboard?</AlertDialogTitle>
            <AlertDialogDescription>This will clear all entries from the scoreboard.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearScoreboard} className="rounded-xl">Clear</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
