import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { CheckCircle2, Hourglass, XCircle, MinusCircle } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageLoader, ErrorState } from '@/components/PageStates';
import { cbtApi, cbtImageUrl } from '@/lib/cbt';
import { CbtFooter } from './CbtFooter';
import { cn } from '@/lib/utils';

const L = 'ABCDE';
function Img({ path }: { path: string }) {
  const [u, setU] = useState<string | null>(null);
  useEffect(() => { cbtImageUrl(path).then(setU); }, [path]);
  return u ? <img src={u} alt="Question figure" className="max-h-56 rounded border" loading="lazy" /> : null;
}

export default function CbtResultPage() {
  const { attemptId = '' } = useParams();
  const [d, setD] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const load = useCallback(() => { setErr(null); cbtApi.result(attemptId).then(setD).catch(e => setErr(e.message)); }, [attemptId]);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <SEO title="CBT Result | Smart AI OMR" description="CBT result" noindex />
      <AppHeader />
      <main className="container py-6 max-w-3xl space-y-5 flex-1">
        {err ? <ErrorState message={err} onRetry={load} /> : !d ? <PageLoader /> : d.status === 'in_progress' ? (
          <Card><CardContent className="p-6 space-y-3 text-center"><p>This exam is still in progress.</p><Link to={`/cbt/attempt/${attemptId}`}><Button>Resume Exam</Button></Link></CardContent></Card>
        ) : d.status === 'pending' ? (
          <Card><CardContent className="p-8 text-center space-y-3">
            <Hourglass className="w-10 h-10 mx-auto text-primary" aria-hidden />
            <h1 className="text-xl font-bold font-display">Submission Received — Result Pending</h1>
            <p className="text-muted-foreground">{d.title}{d.submitted_at && <> · submitted {format(new Date(d.submitted_at), 'd MMM, h:mm a')}</>}</p>
            <p className="text-sm">{d.result_policy === 'scheduled' && d.result_release_at ? `Results will be released on ${format(new Date(d.result_release_at), 'd MMM yyyy, h:mm a')}.` : 'Your teacher will release results soon.'}</p>
            <Link to="/cbt"><Button variant="outline">Back to CBT Exams</Button></Link>
          </CardContent></Card>
        ) : (
          <>
            <div>
              <h1 className="text-2xl font-bold font-display">{d.title}</h1>
              <p className="text-sm text-muted-foreground">{d.subject}{d.submitted_at && ` · submitted ${format(new Date(d.submitted_at), 'd MMM, h:mm a')}`}</p>
            </div>
            <Card><CardContent className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              {[
                ['Score', `${Number(d.result.score)} / ${Number(d.result.max_marks)}`],
                ['Percentage', `${Number(d.result.percentage)}%`],
                ['Accuracy', `${Number(d.result.accuracy)}%`],
                ['Attempted', `${d.result.attempted} / ${d.result.total_questions}`],
                ['Correct', d.result.correct], ['Wrong', d.result.wrong], ['Unanswered', d.result.unanswered],
                ['Marks lost', `−${Number(d.result.negative_marks)}`],
              ].map(([k, v]) => <div key={k as string}><p className="font-mono text-xl font-bold">{v}</p><p className="text-xs text-muted-foreground">{k}</p></div>)}
            </CardContent></Card>
            <section className="space-y-3">
              <h2 className="font-semibold">Question review</h2>
              {d.questions.map((q: any, i: number) => (
                <Card key={q.id}><CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium whitespace-pre-wrap">{i + 1}. {q.text}</p>
                    <span className={cn('shrink-0 inline-flex items-center gap-1 text-xs font-mono', q.status === 'correct' ? 'text-success' : q.status === 'unanswered' ? 'text-muted-foreground' : 'text-destructive')}>
                      {q.status === 'correct' ? <CheckCircle2 className="w-4 h-4" /> : q.status === 'unanswered' ? <MinusCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      {q.status} ({Number(q.marks) > 0 ? '+' : ''}{Number(q.marks)})
                    </span>
                  </div>
                  {q.image_url && <Img path={q.image_url} />}
                  <ul className="space-y-1 text-sm">
                    {q.options.map((o: string, j: number) => {
                      const mine = q.selected?.includes(j); const right = q.correct?.includes(j);
                      return <li key={j} className={cn('rounded border px-2 py-1', right && 'border-success bg-success/10', mine && !right && 'border-destructive bg-destructive/10')}>
                        <span className="font-mono mr-2">{L[j]}</span>{o}{mine && <span className="ml-2 text-xs text-muted-foreground">(your answer)</span>}
                      </li>;
                    })}
                  </ul>
                  {q.explanation && <p className="text-sm rounded bg-muted/50 p-2"><span className="font-semibold">Explanation: </span>{q.explanation}</p>}
                </CardContent></Card>
              ))}
            </section>
          </>
        )}
      </main>
      <CbtFooter />
    </div>
  );
}
