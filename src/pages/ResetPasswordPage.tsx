import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Lock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  // Supabase puts the recovery tokens in the URL hash. The client picks them up
  // automatically via onAuthStateChange (PASSWORD_RECOVERY event).
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') setReady(true);
    });
    // Also accept an already-active recovery session
    supabase.auth.getSession().then(({ data }) => { if (data.session) setReady(true); });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    if (password !== confirm) return toast.error('Passwords do not match');
    setLoading(true);
    const { error } = await updatePassword(password);
    setLoading(false);
    if (error) return toast.error(error.message);
    setDone(true);
    toast.success('Password updated! Redirecting…');
    setTimeout(() => navigate('/'), 1500);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <SEO title="Reset Password | Smart AI OMR Analysis" description="Set a new password for your Smart AI OMR account." noindex />
      <main className="w-full max-w-md">
        <Card className="modern-card">
          <CardHeader className="text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-primary-foreground mx-auto mb-2" style={{ background: 'var(--gradient-primary)' }}>
              <Lock className="w-5 h-5" />
            </div>
            <CardTitle className="font-display">Set a new password</CardTitle>
            <CardDescription>
              {ready ? 'Choose a new password for your account.' : 'Verifying your reset link…'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {done ? (
              <div className="text-center space-y-3 py-4">
                <CheckCircle2 className="w-12 h-12 text-success mx-auto" />
                <p className="text-sm text-muted-foreground">Password updated. Redirecting…</p>
              </div>
            ) : ready ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pw">New password</Label>
                  <Input id="pw" type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} className="rounded-xl h-11" minLength={6} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pw2">Confirm password</Label>
                  <Input id="pw2" type="password" autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} className="rounded-xl h-11" minLength={6} />
                </div>
                <Button type="submit" className="w-full rounded-xl h-11 gap-2" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  Update password
                </Button>
              </form>
            ) : (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
