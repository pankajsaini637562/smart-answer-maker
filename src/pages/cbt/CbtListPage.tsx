import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Clock, CalendarDays, FileQuestion, Loader2, MonitorCheck } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PageLoader, ErrorState, EmptyState } from '@/components/PageStates';
import { cbtApi, categorize, type CardCategory, type CbtExamCard } from '@/lib/cbt';
import { CbtFooter } from './CbtFooter';
import { toast } from 'sonner';

const TABS: { id: CardCategory; label: string }[] = [
  { id: 'available', label: 'Available Now' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'submitted', label: 'Submitted' },
  { id: 'released', label: 'Results' },
  { id: 'expired', label: 'Expired' },
];

export default function CbtListPage() {
  const nav = useNavigate();
  const [data, setData] = useState<{ exams: CbtExamCard[]; offset: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<CardCategory>('available');
  const [open, setOpen] = useState<CbtExamCard | null>(null);
  const [starting, setStarting] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const r = await cbtApi.list();
      setData({ exams: r.exams, offset: new Date(r.server_now).getTime() - Date.now() });
    } catch (e: any) { setError(e.message); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const grouped = useMemo(() => {
    const g: Record<CardCategory, CbtExamCard[]> = { available: [], in_progress: [], upcoming: [], submitted: [], released: [], expired: [] };
    if (data) for (const e of data.exams) g[categorize(e, Date.now() + data.offset)].push(e);
    return g;
  }, [data]);

  useEffect(() => {
    if (grouped.in_progress.length) setTab('in_progress');
  }, [grouped.in_progress.length]);

  const start = async (e: CbtExamCard) => {
    setStarting(true);
    try { const id = await cbtApi.start(e.id); nav(`/cbt/attempt/${id}`); }
    catch (err: any) { toast.error(err.message); load(); }
    finally { setStarting(false); }
  };

  const list = grouped[tab];

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <SEO title="CBT Exams | Smart AI OMR" description="Take scheduled computer-based exams and view results." noindex />
      <AppHeader />
      <main className="container py-6 space-y-5 max-w-4xl flex-1">
        <div className="flex items-center gap-3">
          <MonitorCheck className="w-7 h-7 text-primary" aria-hidden />
          <div>
            <h1 className="text-2xl font-bold font-display">CBT Exams</h1>
            <p className="text-sm text-muted-foreground">Scheduled online exams set by your teachers.</p>
          </div>
        </div>
        {error ? <ErrorState message={error} onRetry={load} /> : !data ? <PageLoader /> : (
          <>
            <Tabs value={tab} onValueChange={v => setTab(v as CardCategory)}>
              <TabsList className="h-auto flex-wrap justify-start">
                {TABS.map(t => (
                  <TabsTrigger key={t.id} value={t.id} className="gap-1">
                    {t.label}{grouped[t.id].length > 0 && <span className="text-xs font-mono">({grouped[t.id].length})</span>}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            {list.length === 0 ? (
              <EmptyState title="No exams here" hint={data.exams.length === 0 ? 'No CBT exams have been published for you yet.' : 'Check the other tabs.'} />
            ) : (
              <div className="grid gap-3">
                {list.map(e => (
                  <Card key={e.id}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="font-semibold text-lg leading-tight">{e.title}</h2>
                          {e.subject && <p className="text-sm text-muted-foreground">{e.subject}</p>}
                        </div>
                        <Badge variant="outline" className="shrink-0">{TABS.find(t => t.id === tab)?.label}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><CalendarDays className="w-4 h-4" aria-hidden />{format(new Date(e.starts_at), 'd MMM, h:mm a')} – {format(new Date(e.ends_at), 'd MMM, h:mm a')}</span>
                        <span className="inline-flex items-center gap-1"><Clock className="w-4 h-4" aria-hidden />{e.duration_minutes} min</span>
                        <span className="inline-flex items-center gap-1"><FileQuestion className="w-4 h-4" aria-hidden />{e.question_count} questions</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => setOpen(e)}>Instructions</Button>
                        {tab === 'available' && <Button size="sm" onClick={() => setOpen(e)}>Start Exam</Button>}
                        {tab === 'in_progress' && <Button size="sm" onClick={() => nav(`/cbt/attempt/${e.active_attempt_id}`)}>Resume Exam</Button>}
                        {(tab === 'submitted' || tab === 'released' || (tab === 'expired' && e.last_attempt_id)) && e.last_attempt_id &&
                          <Button size="sm" variant={tab === 'released' ? 'default' : 'outline'} onClick={() => nav(`/cbt/result/${e.last_attempt_id}`)}>
                            {tab === 'released' ? 'View Result' : 'View Submission'}
                          </Button>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </main>
      <CbtFooter />

      <Dialog open={!!open} onOpenChange={o => !o && setOpen(null)}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto">
          {open && (<>
            <DialogHeader>
              <DialogTitle>{open.title}</DialogTitle>
              <DialogDescription>{open.subject} · {open.duration_minutes} minutes · {open.question_count} questions</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 text-sm">
              {open.description && <p>{open.description}</p>}
              {open.instructions && <div className="whitespace-pre-wrap rounded-md border bg-muted/40 p-3">{open.instructions}</div>}
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Correct: +{open.marks_correct} · Wrong: −{open.marks_wrong} · Not answered: {open.marks_unanswered}</li>
                <li>Multiple-answer questions: full marks only if every correct option is chosen; any wrong option gives negative marks; partly right with no wrong option gives 0.</li>
                <li>The timer starts when you press Start and keeps running even if you close the app. The exam submits itself when time runs out.</li>
                {!open.allow_revisit && <li>You cannot go back to previous questions.</li>}
                <li>Attempts allowed: {open.max_attempts} (used {open.attempts_used}).</li>
                <li>Result: {open.result_policy === 'immediate' ? 'shown right after submission' : open.result_policy === 'scheduled' && open.result_release_at ? `released on ${format(new Date(open.result_release_at), 'd MMM, h:mm a')}` : 'released by the teacher'}.</li>
              </ul>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(null)}>Close</Button>
              {categorize(open, Date.now() + (data?.offset ?? 0)) === 'available' && (
                <Button onClick={() => start(open)} disabled={starting}>{starting && <Loader2 className="w-4 h-4 animate-spin" />}I'm ready — Start</Button>
              )}
            </DialogFooter>
          </>)}
        </DialogContent>
      </Dialog>
    </div>
  );
}
