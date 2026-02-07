import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trophy, Trash2, Eye, Clock, Target, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
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
              <h1 className="text-xl font-semibold">Results History</h1>
              <p className="text-sm text-muted-foreground">{results.length} results</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        {/* Scoreboard */}
        {scoreboard.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Trophy className="w-5 h-5 text-warning" />
                Scoreboard
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setClearAll(true)}>
                Clear
              </Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {scoreboard.slice(0, 5).map((entry, index) => (
                    <div key={entry.id} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-700' :
                          index === 1 ? 'bg-gray-100 text-gray-600' :
                          index === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{entry.sheetTitle}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(entry.completedAt, { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{entry.score}/{entry.maxScore}</p>
                        <p className="text-sm text-muted-foreground">{entry.accuracy}%</p>
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
          <h2 className="text-xl font-semibold mb-4">All Results</h2>
          {results.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Results Yet</h3>
              <p className="text-muted-foreground mb-6">
                Complete an exam to see your results here
              </p>
              <Link to="/">
                <Button>Go to Dashboard</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((result) => (
                <Card key={result.attemptId} className="hover:border-primary transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{result.sheetTitle}</h3>
                        <p className="text-sm text-muted-foreground">
                          {result.completedAt.toLocaleDateString()} • {result.completedAt.toLocaleTimeString()}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="flex items-center gap-1 text-success">
                            <Target className="w-4 h-4" />
                            {result.accuracy}%
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            {formatTime(result.timeSpent)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right mr-4">
                          <p className="text-2xl font-bold">{result.score}</p>
                          <p className="text-sm text-muted-foreground">/{result.maxScore}</p>
                        </div>
                        <Link to={`/result/${result.attemptId}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setDeleteId(result.attemptId)}
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
      </main>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Result?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this exam result.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={clearAll} onOpenChange={setClearAll}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Scoreboard?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all entries from the scoreboard. Individual results will not be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearScoreboard}>
              Clear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
