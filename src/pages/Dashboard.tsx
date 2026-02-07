import { Link } from 'react-router-dom';
import { Plus, FileText, Trophy, Clock, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/StatCard';
import { getSheets, getScoreboard, getResults } from '@/lib/storage';
import { formatDistanceToNow } from 'date-fns';

export default function Dashboard() {
  const sheets = getSheets();
  const scoreboard = getScoreboard().slice(0, 5);
  const results = getResults();

  const totalExams = results.length;
  const avgAccuracy = results.length > 0 
    ? Math.round(results.reduce((sum, r) => sum + r.accuracy, 0) / results.length) 
    : 0;
  const totalTime = results.reduce((sum, r) => sum + r.timeSpent, 0);
  const formatTotalTime = () => {
    const hours = Math.floor(totalTime / 3600);
    const minutes = Math.floor((totalTime % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                <span className="gradient-text">Exam Master</span>
              </h1>
              <p className="text-muted-foreground mt-1">Create & practice OMR sheets</p>
            </div>
            <Link to="/create">
              <Button size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                New OMR Sheet
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        {/* Stats Overview */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Exams"
            value={totalExams}
            icon={FileText}
          />
          <StatCard
            title="Avg Accuracy"
            value={`${avgAccuracy}%`}
            icon={Target}
            variant={avgAccuracy >= 70 ? 'success' : avgAccuracy >= 50 ? 'warning' : 'destructive'}
          />
          <StatCard
            title="Practice Time"
            value={formatTotalTime()}
            icon={Clock}
          />
          <StatCard
            title="OMR Sheets"
            value={sheets.length}
            icon={TrendingUp}
          />
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/create" className="block">
              <Card className="h-full hover:border-primary transition-colors cursor-pointer group">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                    <Plus className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Create OMR Sheet</CardTitle>
                  <CardDescription>
                    Design a new OMR sheet with custom questions
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link to="/sheets" className="block">
              <Card className="h-full hover:border-primary transition-colors cursor-pointer group">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>My Sheets</CardTitle>
                  <CardDescription>
                    View and manage your saved OMR sheets
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link to="/history" className="block">
              <Card className="h-full hover:border-primary transition-colors cursor-pointer group">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                    <Trophy className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Results History</CardTitle>
                  <CardDescription>
                    Review your past exam results
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </section>

        {/* Recent Scores */}
        {scoreboard.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Scores</h2>
              <Link to="/history" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {scoreboard.map((entry, index) => (
                    <div key={entry.id} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{entry.sheetTitle}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(entry.completedAt, { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{entry.score}/{entry.maxScore}</p>
                        <p className="text-sm text-muted-foreground">{entry.accuracy}% accuracy</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Recent Sheets */}
        {sheets.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Sheets</h2>
              <Link to="/sheets" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sheets.slice(0, 3).map((sheet) => (
                <Link key={sheet.id} to={`/exam/${sheet.id}`}>
                  <Card className="hover:border-primary transition-colors cursor-pointer">
                    <CardHeader>
                      <CardTitle className="text-lg">{sheet.title}</CardTitle>
                      <CardDescription>
                        {sheet.totalQuestions} questions • {sheet.optionsPerQuestion} options
                        {sheet.timeLimit > 0 && ` • ${sheet.timeLimit} min`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Created {formatDistanceToNow(sheet.createdAt, { addSuffix: true })}
                        </span>
                        <Button variant="ghost" size="sm">
                          Start →
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {sheets.length === 0 && (
          <section className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No OMR Sheets Yet</h2>
            <p className="text-muted-foreground mb-6">
              Create your first OMR sheet to start practicing
            </p>
            <Link to="/create">
              <Button size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                Create Your First Sheet
              </Button>
            </Link>
          </section>
        )}
      </main>
    </div>
  );
}
