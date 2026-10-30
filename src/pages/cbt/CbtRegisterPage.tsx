import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Download, IdCard } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/PageStates';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cardPdf, portalRpc, type StudentRegistration } from '@/lib/cbtPortal';
import { CbtFooter } from './CbtFooter';
import { toast } from 'sonner';

const FIELDS: [string, string, boolean, string?][] = [
  ['username', 'User name', true, 'e.g. rahul_k'],
  ['full_name', 'Full name', true],
  ['class', 'Class', true, 'e.g. 12'],
  ['stream', 'Stream', true, 'e.g. PCB'],
  ['institute', 'Coaching institute', true],
  ['academic_session', 'Academic session', true, 'e.g. 2026-27'],
  ['batch', 'Batch code', true, 'e.g. NEET26'],
  ['city', 'City', true],
  ['guardian_name', "Father’s / guardian’s name", false],
  ['school', 'School', false],
  ['course', 'Course', false],
];

export default function CbtRegisterPage() {
  const { user } = useAuth() as any;
  const [reg, setReg] = useState<StudentRegistration | null | undefined>(undefined);
  const [cards, setCards] = useState<any[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const isGuest = !!user?.is_anonymous;

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from('cbt_students').select('*').eq('user_id', user.id).maybeSingle();
    setReg((data as any) ?? null);
    if (data) {
      const { data: c } = await supabase.from('cbt_admit_cards').select('*').eq('user_id', user.id).eq('revoked', false).order('created_at', { ascending: false });
      setCards(c ?? []);
    }
  };
  useEffect(() => { load(); }, [user?.id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const missing = FIELDS.find(([k, , req]) => req && !form[k]?.trim());
    if (missing) return toast.error(`${missing[1]} is required`);
    setBusy(true);
    try {
      const { username, ...rest } = form;
      const r = await portalRpc<StudentRegistration>('cbt_register', { _details: { ...rest, extra_details: { username } } });
      toast.success(`Registered! Your roll number is ${r.roll_number}`);
      await load();
    } catch (err: any) { toast.error(err.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <SEO title="CBT Registration | Smart AI OMR" description="Register for CBT exams." noindex />
      <AppHeader />
      <main className="container py-6 max-w-2xl flex-1 space-y-5">
        <h1 className="text-2xl font-bold font-display flex items-center gap-2"><IdCard className="w-6 h-6 text-primary" />CBT Registration</h1>
        {reg === undefined ? <PageLoader /> : isGuest ? (
          <Card><CardContent className="p-5 space-y-3">
            <p>Guest accounts can't register for CBT exams. Create an account with email and password first — that password is what you'll use with your roll number.</p>
            <Button asChild><Link to="/auth">Create account</Link></Button>
          </CardContent></Card>
        ) : reg ? (
          <>
            <Card><CardContent className="p-5 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">Roll number</span>
                <Badge variant={reg.status === 'approved' ? 'default' : 'secondary'} className="capitalize">{reg.status}</Badge>
              </div>
              <p className="text-3xl font-mono font-bold">{reg.roll_number}</p>
              <p className="text-sm">{reg.full_name} · Class {reg.class} · {reg.stream} · {reg.batch}</p>
              <p className="text-sm text-muted-foreground">Sign in on any device with this roll number and your account password.</p>
              <div className="flex gap-2 pt-2">
                <Button asChild><Link to="/cbt">Go to exams</Link></Button>
              </div>
            </CardContent></Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">Admit cards</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {cards.length === 0 ? <p className="text-sm text-muted-foreground">No admit cards yet. They appear here once your institute issues them.</p> :
                  cards.map(c => (
                    <div key={c.id} className="flex items-center justify-between border rounded-md p-3 gap-2">
                      <div className="min-w-0"><p className="font-medium truncate">{c.snapshot?.exam?.title}</p><p className="text-xs font-mono text-muted-foreground">{c.reference}</p></div>
                      <Button size="sm" variant="outline" onClick={async () => (await cardPdf(c)).save(`admit-card-${reg.roll_number}.pdf`)}><Download className="w-4 h-4" />Download</Button>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card><CardContent className="p-5">
            <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
              {FIELDS.map(([k, label, req, ph]) => (
                <div key={k} className="space-y-1">
                  <Label htmlFor={k}>{label}{req && ' *'}</Label>
                  <Input id={k} placeholder={ph} maxLength={k === 'username' ? 60 : 200} value={form[k] ?? ''} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
                </div>
              ))}
              <p className="sm:col-span-2 text-xs text-muted-foreground">Your roll number is created from your batch code, e.g. NEET26-0001. Registration is approved instantly.</p>
              <Button type="submit" disabled={busy} className="sm:col-span-2">{busy && <Loader2 className="w-4 h-4 animate-spin" />}Register</Button>
            </form>
          </CardContent></Card>
        )}
      </main>
      <CbtFooter />
    </div>
  );
}
