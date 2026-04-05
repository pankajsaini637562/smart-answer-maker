import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Sparkles, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPw, setShowLoginPw] = useState(false);

  // Signup
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPw, setShowSignupPw] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) { toast.error('Fill all fields'); return; }
    setLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Welcome back!');
    navigate('/');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupEmail || !signupPassword) { toast.error('Fill all fields'); return; }
    if (signupPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    const { error } = await signUp(signupEmail, signupPassword, signupName || undefined);
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Account created! You are now logged in.');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-primary-foreground font-bold text-xl mx-auto" style={{ background: 'var(--gradient-primary)' }}>
            EM
          </div>
          <h1 className="text-3xl font-bold font-display">
            <span className="gradient-text">Exam Master</span>
          </h1>
          <p className="text-muted-foreground text-sm flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> AI-Powered Smart Learning
          </p>
        </div>

        <Card className="modern-card animate-slide-up">
          <Tabs defaultValue="login">
            <CardHeader className="pb-2">
              <TabsList className="w-full rounded-xl">
                <TabsTrigger value="login" className="flex-1 gap-2 rounded-lg">
                  <LogIn className="w-4 h-4" /> Login
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex-1 gap-2 rounded-lg">
                  <UserPlus className="w-4 h-4" /> Sign Up
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input id="login-email" type="email" placeholder="you@example.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="rounded-xl h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-pw">Password</Label>
                    <div className="relative">
                      <Input id="login-pw" type={showLoginPw ? 'text' : 'password'} placeholder="••••••" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="rounded-xl h-11 pr-10" />
                      <button type="button" onClick={() => setShowLoginPw(!showLoginPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showLoginPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full rounded-xl h-11 gap-2" disabled={loading}>
                    <LogIn className="w-4 h-4" /> {loading ? 'Signing in…' : 'Sign In'}
                  </Button>
                </CardContent>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Display Name (optional)</Label>
                    <Input id="signup-name" placeholder="Your name" value={signupName} onChange={e => setSignupName(e.target.value)} className="rounded-xl h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" type="email" placeholder="you@example.com" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} className="rounded-xl h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-pw">Password</Label>
                    <div className="relative">
                      <Input id="signup-pw" type={showSignupPw ? 'text' : 'password'} placeholder="Min 6 characters" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} className="rounded-xl h-11 pr-10" />
                      <button type="button" onClick={() => setShowSignupPw(!showSignupPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showSignupPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full rounded-xl h-11 gap-2" disabled={loading}>
                    <UserPlus className="w-4 h-4" /> {loading ? 'Creating…' : 'Create Account'}
                  </Button>
                </CardContent>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
