import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Plus, Loader2 } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageLoader, ErrorState, EmptyState } from '@/components/PageStates';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { cbtApi } from '@/lib/cbt';
import { CbtFooter } from './CbtFooter';
import { toast } from 'sonner';

export function examPhase(e: { status: string; starts_at: string | null; ends_at: string | null }) {
  if (e.status !== 'published') return e.status;
  const now = Date.now();
  if (e.starts_at && now < Date.parse(e.starts_at)) return 'upcoming';
  if (e.ends_at && now >= Date.parse(e.ends_at)) return 'completed';
  return 'live';
}

export default function CbtAdminPage() {
  const { isAdmin, loading } = useIsAdmin();
  const { user } = useAuth();
  const nav = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [exams, setExams] = useState<any[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setErr(null);
    try {
      const [s, { data, error }] = await Promise.all([
        cbtApi.adminStats(),
        supabase.from('cbt_exams').select('id,title,subject,status,starts_at,ends_at,duration_minutes,updated_at').order('updated_at', { ascending: false }),
      ]);
      if (error) throw error;
      setStats(s); setExams(data ?? []);
    } catch (e: any) { setErr(e.message); }
  }, []);
  useEffect(() => { if (isAdmin) load(); }, [isAdmin, load]);

  const create = async () => {
    setCreating(true);
    const start = new Date(Date.now() + 86400000); start.setMinutes(0, 0, 0);
    const end = new Date(start.getTime() + 3 * 3600000);
    const { data, error } = await supabase.from('cbt_exams').insert({
      title: 'Untitled exam', created_by: user?.id, starts_at: start.toISOString(), ends_at: end.toISOString(),
    }).select('id').single();
    setCreating(false);
    if (error) return toast.error(error.message);
    nav(`/admin/cbt/${data.id}`);
  };

  if (loading) return <PageLoader />;
  if (!isAdmin) return <Navigate to="/app" replace />;

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <SEO title="CBT Admin | Smart AI OMR" description="Manage CBT exams" noindex />
      <AppHeader />
      <main className="container py-6 space-y-6 max-w-5xl flex-1">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold font-display">CBT Exam Admin</h1>
            <p className="text-sm text-muted-foreground"><Link to="/admin" className="underline">Admin Panel</Link> › CBT Exams</p>
          </div>
          <Button onClick={create} disabled={creating}>{creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}Create Exam</Button>
        </div>
        {err ? <ErrorState message={err} onRetry={load} /> : !stats ? <PageLoader /> : (
          <>
            <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[['Published', stats.published], ['Drafts', stats.drafts], ['Upcoming', stats.upcoming], ['Live now', stats.active], ['Completed', stats.completed], ['Students', stats.students]].map(([k, v]) => (
                <Card key={k}><CardContent className="p-4"><p className="font-mono text-2xl font-bold">{v}</p><p className="text-xs text-muted-foreground">{k}</p></CardContent></Card>
              ))}
            </section>
            <section className="space-y-2">
              <h2 className="font-semibold">Exams</h2>
              {exams!.length === 0 ? <EmptyState title="No exams yet" hint="Create your first CBT exam." /> : exams!.map(e => (
                <Link key={e.id} to={`/admin/cbt/${e.id}`} className="block">
                  <Card className="hover:border-primary transition-colors"><CardContent className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{e.title}</p>
                      <p className="text-xs text-muted-foreground">{e.subject || 'No subject'} · {e.starts_at ? format(new Date(e.starts_at), 'd MMM yyyy, h:mm a') : 'not scheduled'} · {e.duration_minutes} min</p>
                    </div>
                    <Badge variant={e.status === 'published' ? 'default' : 'outline'} className="capitalize">{examPhase(e)}</Badge>
                  </CardContent></Card>
                </Link>
              ))}
            </section>
            <section className="space-y-2">
              <h2 className="font-semibold">Recent activity</h2>
              {stats.recent.length === 0 ? <p className="text-sm text-muted-foreground">No activity yet.</p> : (
                <ul className="text-sm divide-y rounded-md border bg-card">
                  {stats.recent.map((r: any, i: number) => (
                    <li key={i} className="p-2 flex justify-between gap-2"><span><b>{r.name}</b> {r.event.replace('_', ' ')} · {r.title}</span><span className="text-muted-foreground text-xs shrink-0">{format(new Date(r.created_at), 'd MMM, h:mm a')}</span></li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
      <CbtFooter />
    </div>
  );
}
