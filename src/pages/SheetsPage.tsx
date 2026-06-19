import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Play, Trash2, MoreVertical, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { AppHeader } from '@/components/AppHeader';
import { SEO } from '@/components/SEO';
import { getSheets, deleteSheet } from '@/lib/storage';
import { OMRSheet } from '@/types/exam';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export default function SheetsPage() {
  const [sheets, setSheets] = useState<OMRSheet[]>(getSheets());
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    deleteSheet(id);
    setSheets(getSheets());
    setDeleteId(null);
    toast.success('Sheet deleted');
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="My OMR Sheets | Smart AI OMR Analysis" description="Browse, manage, and launch your saved OMR practice sheets for exam prep." />
      <AppHeader />
      <main>

      <div className="container py-6">
        <div className="flex items-center justify-between mb-6 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold font-display">My OMR Sheets</h2>
            <p className="text-sm text-muted-foreground">{sheets.length} sheets created</p>
          </div>
          <Link to="/create">
            <Button className="gap-2 rounded-xl shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4" />
              New Sheet
            </Button>
          </Link>
        </div>

        {sheets.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-20 h-20 rounded-3xl bg-accent flex items-center justify-center mx-auto mb-6 animate-float">
              <FileText className="w-10 h-10 text-accent-foreground" />
            </div>
            <h3 className="text-2xl font-bold font-display mb-2">No Sheets Yet</h3>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              Create your first OMR sheet to start practicing
            </p>
            <Link to="/create">
              <Button size="lg" className="gap-2 rounded-xl px-8 h-12">
                <Plus className="w-5 h-5" />
                Create Sheet
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sheets.map((sheet, i) => (
              <Card key={sheet.id} className="modern-card group animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base font-display">{sheet.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {sheet.totalQuestions} questions • {sheet.optionsPerQuestion} options
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity rounded-xl w-8 h-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setDeleteId(sheet.id)} className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      {sheet.timeLimit > 0 && (
                        <Badge variant="secondary" className="rounded-lg font-normal">{sheet.timeLimit} min</Badge>
                      )}
                      {sheet.negativeMarking > 0 && (
                        <Badge variant="secondary" className="rounded-lg font-normal">-{sheet.negativeMarking}</Badge>
                      )}
                      <Badge variant="secondary" className="rounded-lg font-normal">{sheet.marksPerQuestion} marks/Q</Badge>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(sheet.createdAt, { addSuffix: true })}
                      </span>
                      <Link to={`/exam/${sheet.id}`}>
                        <Button size="sm" className="gap-2 rounded-lg">
                          <Play className="w-3.5 h-3.5" />
                          Start
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Delete Sheet?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the OMR sheet and all associated data.
            </AlertDialogDescription>
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
      </main>
    </div>
  );
}
