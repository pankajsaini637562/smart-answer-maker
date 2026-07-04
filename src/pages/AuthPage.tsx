import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, GraduationCap, Loader2, Mail, Lock, ArrowLeft } from 'lucide-react';

function safeNext(raw: string | null): string {
  if (!raw) return '/';
  // Only allow same-origin relative paths.
  if (!raw.startsWith('/') || raw.startsWith('//')) return '/';
  return raw;
}
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';

const CLASSES = ['6th', '7th', '8th', '9th', '10th', '11th', '12th', 'Dropper', 'College'];
const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'United Arab Emirates',
  'Singapore', 'Nepal', 'Bangladesh', 'Pakistan', 'Sri Lanka', 'Saudi Arabia', 'Qatar',
  'Germany', 'France', 'Netherlands', 'South Africa', 'Nigeria', 'Kenya', 'Malaysia',
  'Indonesia', 'Philippines', 'Japan', 'South Korea', 'China', 'Brazil', 'Mexico', 'Other'
];

export default function AuthPage() {
  const { signUp, signIn, resetPassword, signInAnonymously } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = safeNext(searchParams.get('next'));
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');

  // Sign up
  const [name, setName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [country, setCountry] = useState('');
  const [school, setSchool] = useState('');
  const [phone, setPhone] = useState('');

  // Shared
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Please enter your name');
    if (!studentClass) return toast.error('Please select your class');
    if (!country) return toast.error('Please select your country');

    const hasEmail = email.trim().length > 0;
    const hasPassword = password.length > 0;

    // If either email or password is provided, both are required (min 6 chars)
    if (hasEmail || hasPassword) {
      if (!hasEmail) return toast.error('Please enter your email (or leave both email and password blank)');
      if (password.length < 6) return toast.error('Password must be at least 6 characters');
    }

    setLoading(true);
    if (hasEmail && hasPassword) {
      const { error } = await signUp(email.trim(), password, name.trim(), studentClass, country, school.trim(), phone.trim());
      setLoading(false);
      if (error) return toast.error(error.message);
      // Email is auto-confirmed — sign in immediately
      const { error: signInErr } = await signIn(email.trim(), password);
      if (signInErr) {
        toast.success('Account created! Please sign in.');
        setMode('signin');
        setPassword('');
        return;
      }
      toast.success('Welcome! 🎉');
      navigate(nextPath);
    } else {
      // No email/password — use anonymous auth so all features stay the same
      const { error } = await signInAnonymously(name.trim(), studentClass, country, school.trim(), phone.trim());
      setLoading(false);
      if (error) return toast.error(error.message);
      toast.success('Welcome! 🎉');
      navigate(nextPath);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return toast.error('Enter your email and password');
    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success('Welcome back! 🎉');
    navigate(nextPath);
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return toast.error('Enter your email');
    setLoading(true);
    const { error } = await resetPassword(email.trim());
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success('Password reset link sent! Check your email.');
    setMode('signin');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <SEO title="Sign In | Smart AI OMR Analysis" description="Sign in or create your free Smart AI OMR account to start AI-powered exam practice." />
      <main className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-primary-foreground font-bold text-xl mx-auto" style={{ background: 'var(--gradient-primary)' }}>
            EM
          </div>
          <h1 className="text-3xl font-bold font-display">
            <span className="gradient-text">Smart AI OMR Analysis</span>
          </h1>
          <p className="text-muted-foreground text-sm flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> AI-Powered Smart Learning
          </p>
        </div>

        <Card className="modern-card animate-slide-up">
          {mode === 'forgot' ? (
            <>
              <CardHeader className="text-center pb-2">
                <CardTitle className="font-display">Reset your password</CardTitle>
                <CardDescription>We'll email you a secure reset link.</CardDescription>
              </CardHeader>
              <form onSubmit={handleForgot}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-forgot">Email</Label>
                    <Input id="email-forgot" type="email" value={email} onChange={e => setEmail(e.target.value)} className="rounded-xl h-11" placeholder="you@example.com" />
                  </div>
                  <Button type="submit" className="w-full rounded-xl h-11 gap-2" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                    Send reset link
                  </Button>
                  <button type="button" onClick={() => setMode('signin')} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mx-auto">
                    <ArrowLeft className="w-3 h-3" /> Back to sign in
                  </button>
                </CardContent>
              </form>
            </>
          ) : (
            <Tabs value={mode} onValueChange={(v) => setMode(v as 'signin' | 'signup')}>
              <TabsList className="grid w-full grid-cols-2 m-4 mb-0 w-[calc(100%-2rem)]">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Create account</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="mt-0">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="font-display flex items-center justify-center gap-2">
                    <GraduationCap className="w-5 h-5 text-primary" /> Welcome back
                  </CardTitle>
                  <CardDescription>Sign in with your email and password</CardDescription>
                </CardHeader>
                <form onSubmit={handleSignIn}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-in">Email</Label>
                      <Input id="email-in" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="rounded-xl h-11" placeholder="you@example.com" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password-in">Password</Label>
                        <button type="button" onClick={() => setMode('forgot')} className="text-xs text-primary hover:underline">
                          Forgot password?
                        </button>
                      </div>
                      <Input id="password-in" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} className="rounded-xl h-11" placeholder="••••••••" />
                    </div>
                    <Button type="submit" className="w-full rounded-xl h-11 gap-2" disabled={loading}>
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                      Sign in
                    </Button>
                  </CardContent>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-0">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="font-display flex items-center justify-center gap-2">
                    <GraduationCap className="w-5 h-5 text-primary" /> Create your account
                  </CardTitle>
                  <CardDescription>Email &amp; password are optional — add them to sign in from other devices.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSignUp}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name *</Label>
                      <Input id="name" placeholder="e.g. Rahul Sharma" value={name} onChange={e => setName(e.target.value)} className="rounded-xl h-11" maxLength={50} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="class">Class *</Label>
                        <Select value={studentClass} onValueChange={setStudentClass}>
                          <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Class" /></SelectTrigger>
                          <SelectContent>{CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country *</Label>
                        <Select value={country} onValueChange={setCountry}>
                          <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Country" /></SelectTrigger>
                          <SelectContent>{COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="school">School / Institute (optional)</Label>
                      <Input id="school" placeholder="e.g. Delhi Public School" value={school} onChange={e => setSchool(e.target.value)} className="rounded-xl h-11" maxLength={100} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone (optional)</Label>
                      <Input id="phone" type="tel" placeholder="e.g. 9876543210" value={phone} onChange={e => setPhone(e.target.value)} className="rounded-xl h-11" maxLength={15} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-up">Email (optional)</Label>
                      <Input id="email-up" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="rounded-xl h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-up">Password (optional)</Label>
                      <Input id="password-up" type="password" autoComplete="new-password" placeholder="At least 6 characters" value={password} onChange={e => setPassword(e.target.value)} className="rounded-xl h-11" />
                    </div>
                    <Button type="submit" className="w-full rounded-xl h-11 gap-2" disabled={loading}>
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GraduationCap className="w-4 h-4" />}
                      Create account
                    </Button>
                    <p className="text-[11px] text-muted-foreground text-center">
                      Skip email &amp; password to start instantly. Add them to sign in from other devices — no verification needed.
                    </p>
                  </CardContent>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </Card>
      </main>
    </div>
  );
}
