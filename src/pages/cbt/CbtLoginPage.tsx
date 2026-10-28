import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signInWithRoll } from '@/lib/cbtPortal';
import { toast } from 'sonner';

export default function CbtLoginPage() {
  const nav = useNavigate();
  const [roll, setRoll] = useState('');
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try { await signInWithRoll(roll.trim().toUpperCase(), pw); nav('/cbt'); }
    catch (err: any) { toast.error(err.message); }
    finally { setBusy(false); }
  };
  return (
    <div className="min-h-dvh bg-background flex items-center justify-center p-4">
      <SEO title="CBT Sign in | Smart AI OMR" description="Sign in with your roll number." noindex />
      <Card className="w-full max-w-sm">
        <CardHeader><CardTitle className="font-display">CBT Exam Sign in</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1"><Label htmlFor="roll">Roll number</Label>
              <Input id="roll" placeholder="NEET26-0001" value={roll} onChange={e => setRoll(e.target.value)} className="font-mono uppercase" required /></div>
            <div className="space-y-1"><Label htmlFor="pw">Password</Label>
              <Input id="pw" type="password" value={pw} onChange={e => setPw(e.target.value)} required /></div>
            <Button type="submit" className="w-full" disabled={busy}>{busy && <Loader2 className="w-4 h-4 animate-spin" />}Sign in</Button>
            <p className="text-sm text-center text-muted-foreground">New student? <Link to="/auth" className="text-primary underline">Create an account</Link>, then register for CBT.</p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
