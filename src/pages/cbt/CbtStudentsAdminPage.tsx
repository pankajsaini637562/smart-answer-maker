import { useEffect, useMemo, useState } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageLoader, ErrorState, EmptyState } from '@/components/PageStates';
import { supabase } from '@/integrations/supabase/client';
import { portalRpc, type StudentRegistration } from '@/lib/cbtPortal';
import { toast } from 'sonner';

export default function CbtStudentsAdminPage() {
  const [rows, setRows] = useState<StudentRegistration[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const load = async () => {
    const { data, error } = await supabase.from('cbt_students').select('*').order('created_at', { ascending: false });
    if (error) setError(error.message); else setRows(data as any);
  };
  useEffect(() => { load(); }, []);
  const setStatus = async (s: StudentRegistration, status: string) => {
    try { await portalRpc('cbt_review_student', { _user: s.user_id, _status: status, _note: null }); toast.success(`${s.roll_number}: ${status}`); load(); }
    catch (e: any) { toast.error(e.message); }
  };
  const list = useMemo(() => (rows ?? []).filter(r => `${r.roll_number} ${r.full_name} ${r.batch} ${r.city}`.toLowerCase().includes(q.toLowerCase())), [rows, q]);
  return (
    <div className="min-h-dvh bg-background">
      <SEO title="CBT Students | Admin" description="Manage CBT students." noindex />
      <AppHeader />
      <main className="container py-6 max-w-4xl space-y-4">
        <h1 className="text-2xl font-bold font-display">CBT Students</h1>
        <p className="text-sm text-muted-foreground">New registrations are approved automatically. Suspend a student to block their sign-in.</p>
        <Input placeholder="Search roll number, name, batch, city" value={q} onChange={e => setQ(e.target.value)} />
        {error ? <ErrorState message={error} onRetry={load} /> : !rows ? <PageLoader /> : list.length === 0 ? <EmptyState title="No students yet" /> : list.map(s => (
          <Card key={s.user_id}><CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono font-bold">{s.roll_number} <Badge variant={s.status === 'approved' ? 'default' : 'secondary'} className="ml-1 capitalize">{s.status}</Badge></p>
              <p className="text-sm">{s.full_name} ({s.extra_details?.username}) · Class {s.class} · {s.stream}</p>
              <p className="text-xs text-muted-foreground">{s.institute} · {s.batch} · {s.academic_session} · {s.city}</p>
            </div>
            {s.status === 'approved'
              ? <Button size="sm" variant="outline" onClick={() => setStatus(s, 'suspended')}>Suspend</Button>
              : <Button size="sm" onClick={() => setStatus(s, 'approved')}>Approve</Button>}
          </CardContent></Card>
        ))}
      </main>
    </div>
  );
}
