import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, CloudOff, Loader2, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PageLoader, ErrorState } from '@/components/PageStates';
import { SEO } from '@/components/SEO';
import { cbtApi, cbtImageUrl, formatClock, remainingSeconds, type CbtPaper } from '@/lib/cbt';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Resp = { selected: number[]; marked: boolean };
type Local = { responses: Record<string, Resp>; visited: string[]; current: number; pending: string[] };

const LETTERS = 'ABCDE';

function QImage({ path }: { path: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => { cbtImageUrl(path).then(setUrl); }, [path]);
  return url ? <img src={url} alt="Question figure" className="max-h-72 rounded-md border bg-card object-contain" loading="lazy" /> : null;
}

export default function CbtAttemptPage() {
  const { attemptId = '' } = useParams();
  const nav = useNavigate();
  const storeKey = `cbt-attempt-${attemptId}`;
  const [paper, setPaper] = useState<CbtPaper | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [left, setLeft] = useState<number | null>(null);
  const [local, setLocal] = useState<Local>({ responses: {}, visited: [], current: 0, pending: [] });
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const localRef = useRef(local); localRef.current = local;
  const finishedRef = useRef(false);
  const warned = useRef<Set<number>>(new Set());

  // Load paper
  const load = useCallback(async () => {
    setError(null);
    try {
      const p = await cbtApi.paper(attemptId);
      if (p.status !== 'in_progress') { nav(`/cbt/result/${attemptId}`, { replace: true }); return; }
      setOffset(new Date(p.server_now).getTime() - Date.now());
      const server: Record<string, Resp> = {};
      p.responses.forEach(r => { server[r.question_id] = { selected: r.selected, marked: r.marked }; });
      let saved: Local | null = null;
      try { saved = JSON.parse(localStorage.getItem(storeKey) || 'null'); } catch { /* ignore */ }
      // Unsynced local answers win over server copy; they are re-sent below.
      const responses = { ...server };
      const pending = saved?.pending ?? [];
      pending.forEach(id => { if (saved?.responses[id]) responses[id] = saved.responses[id]; });
      const first = p.questions[0]?.id;
      setLocal({
        responses, pending,
        visited: Array.from(new Set([...(saved?.visited ?? []), ...(first ? [first] : [])])),
        current: Math.min(saved?.current ?? 0, Math.max(0, p.questions.length - 1)),
      });
      setPaper(p);
    } catch (e: any) { setError(e.message); }
  }, [attemptId, nav, storeKey]);
  useEffect(() => { load(); }, [load]);

  // Persist locally
  useEffect(() => { if (paper) localStorage.setItem(storeKey, JSON.stringify(local)); }, [local, paper, storeKey]);

  // Sync pending answers to the server
  const flush = useCallback(async () => {
    const ids = [...localRef.current.pending];
    if (!ids.length) return true;
    setSaving(true);
    let ok = true;
    for (const id of ids) {
      const r = localRef.current.responses[id] ?? { selected: [], marked: false };
      try {
        await cbtApi.save(attemptId, id, r.selected, r.marked);
        setLocal(l => {
          const same = l.responses[id] && JSON.stringify(l.responses[id]) === JSON.stringify(r);
          return same ? { ...l, pending: l.pending.filter(p => p !== id) } : l;
        });
      } catch (e: any) {
        ok = false;
        if (/submitted|Time is up/i.test(e.message)) { finishedRef.current = true; nav(`/cbt/result/${attemptId}`, { replace: true }); return false; }
      }
    }
    setSaving(false);
    return ok;
  }, [attemptId, nav]);

  useEffect(() => {
    if (!paper || !local.pending.length) return;
    const t = setTimeout(() => { flush(); }, 600);
    return () => clearTimeout(t);
  }, [local.pending, local.responses, paper, flush]);
  useEffect(() => {
    const t = setInterval(() => { if (localRef.current.pending.length) flush(); }, 5000);
    const online = () => flush();
    window.addEventListener('online', online);
    return () => { clearInterval(t); window.removeEventListener('online', online); };
  }, [flush]);

  const doSubmit = useCallback(async (auto: boolean) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setSubmitting(true);
    await flush();
    try {
      await cbtApi.submit(attemptId);
      localStorage.removeItem(storeKey);
      if (auto) toast.info('Time is up — your exam was submitted.');
      nav(`/cbt/result/${attemptId}`, { replace: true });
    } catch (e: any) {
      finishedRef.current = false; setSubmitting(false);
      toast.error(`Could not submit: ${e.message}. Check your internet and try again.`);
    }
  }, [attemptId, flush, nav, storeKey]);

  // Timer
  useEffect(() => {
    if (!paper) return;
    const tick = () => {
      const s = remainingSeconds(paper.deadline, Date.now(), offset);
      setLeft(s);
      for (const w of [300, 60]) if (s <= w && s > 0 && !warned.current.has(w)) {
        warned.current.add(w); toast.warning(`${w / 60} minute${w > 60 ? 's' : ''} left`);
      }
      if (s <= 0) doSubmit(true);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [paper, offset, doSubmit]);

  const qs = paper?.questions ?? [];
  const q = qs[local.current];
  const resp = q ? local.responses[q.id] : undefined;

  const counts = useMemo(() => {
    let answered = 0, marked = 0;
    for (const x of qs) { const r = local.responses[x.id]; if (r?.selected.length) answered++; if (r?.marked) marked++; }
    return { answered, unanswered: qs.length - answered, marked };
  }, [qs, local.responses]);

  const update = (id: string, r: Resp) => setLocal(l => ({
    ...l, responses: { ...l.responses, [id]: r }, pending: l.pending.includes(id) ? l.pending : [...l.pending, id],
  }));
  const go = (i: number) => {
    if (!paper || i < 0 || i >= qs.length) return;
    if (!paper.allow_revisit && i < local.current) return;
    setLocal(l => ({ ...l, current: i, visited: l.visited.includes(qs[i].id) ? l.visited : [...l.visited, qs[i].id] }));
  };
  const toggle = (opt: number) => {
    if (!q) return;
    const cur = resp?.selected ?? [];
    const selected = q.multi ? (cur.includes(opt) ? cur.filter(x => x !== opt) : [...cur, opt]) : [opt];
    update(q.id, { selected, marked: resp?.marked ?? false });
  };

  if (error) return <div className="min-h-dvh grid place-items-center p-4"><ErrorState message={error} onRetry={load} /></div>;
  if (!paper || left === null) return <PageLoader label="Opening your exam…" />;

  const stateOf = (id: string, i: number) => {
    const r = local.responses[id]; const a = !!r?.selected.length; const m = !!r?.marked;
    if (i === local.current) return 'current';
    if (a && m) return 'answered-marked';
    if (m) return 'marked';
    if (a) return 'answered';
    if (local.visited.includes(id)) return 'not-answered';
    return 'not-visited';
  };
  const stateClass: Record<string, string> = {
    'current': 'ring-2 ring-primary ring-offset-2 ring-offset-background bg-card text-foreground border-primary',
    'answered': 'bg-success text-success-foreground border-success',
    'not-answered': 'bg-destructive/15 text-destructive border-destructive',
    'marked': 'bg-accent text-accent-foreground border-accent-foreground/40 rounded-full',
    'answered-marked': 'bg-success text-success-foreground border-accent-foreground rounded-full ring-2 ring-accent',
    'not-visited': 'bg-muted text-muted-foreground border-border',
  };
  const low = left <= 300;
  const pendingCount = local.pending.length;

  const Palette = (
    <div className="space-y-3">
      <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-5 gap-2">
        {qs.map((x, i) => (
          <button key={x.id} onClick={() => go(i)} disabled={!paper.allow_revisit && i < local.current}
            aria-label={`Question ${i + 1}, ${stateOf(x.id, i).replace('-', ' ')}`}
            className={cn('h-10 min-w-10 rounded-md border text-sm font-mono font-semibold disabled:opacity-40', stateClass[stateOf(x.id, i)])}>
            {i + 1}
          </button>
        ))}
      </div>
      <ul className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
        <li className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-success" />Answered</li>
        <li className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-destructive/40" />Not answered</li>
        <li className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-accent border" />Marked</li>
        <li className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-success ring-1 ring-accent-foreground" />Answered + marked</li>
        <li className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-muted border" />Not visited</li>
      </ul>
    </div>
  );

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <SEO title={`${paper.title} | CBT`} description="CBT exam" noindex />
      <header className="sticky top-0 z-40 border-b bg-card">
        <div className="container py-2 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold truncate">{paper.title}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1" aria-live="polite">
              {pendingCount > 0
                ? (saving ? <><Loader2 className="w-3 h-3 animate-spin" />Saving…</> : <><CloudOff className="w-3 h-3 text-destructive" />{pendingCount} not saved — retrying</>)
                : <><CheckCircle2 className="w-3 h-3 text-success" />All answers saved</>}
            </p>
          </div>
          <div className={cn('flex items-center gap-1.5 font-mono text-lg font-bold px-3 py-1 rounded-md border', low ? 'text-destructive border-destructive' : '')} role="timer" aria-label="Time remaining">
            <Timer className="w-4 h-4" aria-hidden />{formatClock(left)}
          </div>
        </div>
      </header>

      <div className="container flex-1 py-4 grid lg:grid-cols-[1fr_280px] gap-6">
        <main className="space-y-4 pb-36 lg:pb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">Question {local.current + 1} of {qs.length}{q?.section ? ` · ${q.section}` : ''}</span>
            <span className="text-muted-foreground font-mono">+{q?.marks} / −{q?.negative}{q?.multi ? ' · multiple answers' : ''}</span>
          </div>
          {q && (
            <div className="rounded-lg border bg-card p-4 space-y-4">
              <p className="whitespace-pre-wrap text-base leading-relaxed">{q.text}</p>
              {q.image_url && <QImage path={q.image_url} />}
              <div className="space-y-2" role={q.multi ? 'group' : 'radiogroup'}>
                {q.options.map((o, i) => {
                  const on = resp?.selected.includes(i);
                  return (
                    <button key={i} onClick={() => toggle(i)} role={q.multi ? 'checkbox' : 'radio'} aria-checked={!!on}
                      className={cn('w-full flex items-start gap-3 text-left rounded-md border p-3 min-h-12 transition-colors',
                        on ? 'border-primary bg-primary/10' : 'hover:bg-muted/60')}>
                      <span className={cn('shrink-0 w-7 h-7 grid place-items-center border font-mono text-sm', q.multi ? 'rounded-md' : 'rounded-full', on && 'bg-primary text-primary-foreground border-primary')}>{LETTERS[i]}</span>
                      <span className="pt-0.5">{o}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <div className="lg:hidden rounded-lg border bg-card p-3">
            <div className="flex justify-between text-xs mb-2"><span>Answered {counts.answered}</span><span>Not answered {counts.unanswered}</span><span>Marked {counts.marked}</span></div>
            {Palette}
          </div>
        </main>
        <aside className="hidden lg:block space-y-3">
          <div className="rounded-lg border bg-card p-3 space-y-3 sticky top-20">
            <div className="grid grid-cols-3 text-center text-xs">
              <div><p className="font-mono text-lg font-bold">{counts.answered}</p>Answered</div>
              <div><p className="font-mono text-lg font-bold">{counts.unanswered}</p>Left</div>
              <div><p className="font-mono text-lg font-bold">{counts.marked}</p>Marked</div>
            </div>
            {Palette}
          </div>
        </aside>
      </div>

      <div className="fixed lg:sticky bottom-0 inset-x-0 border-t bg-card z-40">
        <div className="container py-2 grid grid-cols-3 sm:flex sm:flex-wrap gap-2">
          <Button variant="outline" onClick={() => go(local.current - 1)} disabled={!paper.allow_revisit || local.current === 0}>Previous</Button>
          <Button variant="outline" onClick={() => q && update(q.id, { selected: [], marked: resp?.marked ?? false })} disabled={!resp?.selected.length}>Clear</Button>
          <Button variant="outline" onClick={() => { if (q) update(q.id, { selected: resp?.selected ?? [], marked: !resp?.marked }); go(local.current + 1); }}>
            {resp?.marked ? 'Unmark' : 'Mark & Next'}
          </Button>
          <Button variant="outline" onClick={() => go(local.current + 1)} disabled={local.current >= qs.length - 1}>Next</Button>
          <Button onClick={() => { flush(); go(local.current + 1); }} disabled={local.current >= qs.length - 1}>Save & Next</Button>
          <Button variant="secondary" className="sm:ml-auto" onClick={() => { flush(); setConfirm(true); }}>Review & Submit</Button>
        </div>
      </div>

      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit exam?</DialogTitle>
            <DialogDescription>You can't change answers after submitting.</DialogDescription>
          </DialogHeader>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt>Total questions</dt><dd className="font-mono text-right">{qs.length}</dd>
            <dt>Answered</dt><dd className="font-mono text-right">{counts.answered}</dd>
            <dt>Not answered</dt><dd className="font-mono text-right">{counts.unanswered}</dd>
            <dt>Marked for review</dt><dd className="font-mono text-right">{counts.marked}</dd>
            <dt>Time left</dt><dd className="font-mono text-right">{formatClock(left)}</dd>
          </dl>
          {pendingCount > 0 && <p className="text-sm text-destructive flex gap-1"><AlertTriangle className="w-4 h-4" />{pendingCount} answer(s) not saved yet. We'll try again before submitting.</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(false)}>Continue Exam</Button>
            <Button onClick={() => doSubmit(false)} disabled={submitting}>{submitting && <Loader2 className="w-4 h-4 animate-spin" />}Submit Exam</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
