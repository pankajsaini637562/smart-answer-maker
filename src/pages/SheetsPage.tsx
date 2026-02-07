import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Play, Edit, Trash2, MoreVertical, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
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
      <header className="border-b bg-card">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold">My OMR Sheets</h1>
                <p className="text-sm text-muted-foreground">{sheets.length} sheets</p>
              </div>
            </div>
            <Link to="/create">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Sheet
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {sheets.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No Sheets Yet</h2>
            <p className="text-muted-foreground mb-6">
              Create your first OMR sheet to start practicing
            </p>
            <Link to="/create">
              <Button size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                Create Sheet
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sheets.map((sheet) => (
              <Card key={sheet.id} className="group hover:border-primary transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{sheet.title}</CardTitle>
                      <CardDescription>
                        {sheet.totalQuestions} questions • {sheet.optionsPerQuestion} options
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
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
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      {sheet.timeLimit > 0 && (
                        <span className="px-2 py-1 bg-muted rounded">{sheet.timeLimit} min</span>
                      )}
                      {sheet.negativeMarking > 0 && (
                        <span className="px-2 py-1 bg-muted rounded">-{sheet.negativeMarking} marking</span>
                      )}
                      <span className="px-2 py-1 bg-muted rounded">{sheet.marksPerQuestion} marks/Q</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(sheet.createdAt, { addSuffix: true })}
                      </span>
                      <Link to={`/exam/${sheet.id}`}>
                        <Button size="sm" className="gap-2">
                          <Play className="w-4 h-4" />
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
      </main>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sheet?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the OMR sheet and all associated data.
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
    </div>
  );
}
