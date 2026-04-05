import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, User, Save, LogOut, Target, Clock, Trophy, Brain, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { AppHeader } from '@/components/AppHeader';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const TARGET_EXAMS = ['NEET', 'JEE Main', 'JEE Advanced', 'UPSC', 'SSC', 'GATE', 'CAT', 'CLAT', 'CUET', 'Board Exams', 'Other'];

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [targetExam, setTargetExam] = useState('NEET');
  const [studyHoursGoal, setStudyHoursGoal] = useState(4);

  // Stats
  const [stats, setStats] = useState({ totalExams: 0, avgAccuracy: 0, totalTime: 0 });

  useEffect(() => {
    if (!user) return;
    loadProfile();
    loadStats();
  }, [user]);

  const loadProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('id', user!.id).single();
    if (data) {
      setDisplayName(data.display_name || '');
      setTargetExam(data.target_exam || 'NEET');
      setStudyHoursGoal(data.study_hours_goal || 4);
    }
    setLoading(false);
  };

  const loadStats = async () => {
    const { data: results } = await supabase.from('results').select('accuracy, time_spent').eq('user_id', user!.id);
    if (results && results.length > 0) {
      const avg = Math.round(results.reduce((s, r) => s + Number(r.accuracy), 0) / results.length);
      const total = results.reduce((s, r) => s + r.time_spent, 0);
      setStats({ totalExams: results.length, avgAccuracy: avg, totalTime: total });
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      display_name: displayName,
      target_exam: targetExam,
      study_hours_goal: studyHoursGoal,
      updated_at: new Date().toISOString(),
    }).eq('id', user.id);
    setSaving(false);
    if (error) { toast.error('Failed to save'); return; }
    toast.success('Profile updated!');
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
  };

  const initials = displayName ? displayName.slice(0, 2).toUpperCase() : (user?.email?.slice(0, 2).toUpperCase() || 'U');
  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="container py-6 max-w-2xl space-y-6">
        <div className="flex items-center gap-3 animate-fade-in">
          <Link to="/"><Button variant="ghost" size="icon" className="rounded-xl"><ArrowLeft className="w-5 h-5" /></Button></Link>
          <div>
            <h2 className="text-2xl font-bold font-display">Profile & Settings</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        {/* Avatar & Name */}
        <Card className="modern-card animate-slide-up">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="font-display">{displayName || 'Student'}</CardTitle>
                <CardDescription>{user?.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 animate-slide-up stagger-1">
          <Card className="modern-card">
            <CardContent className="p-4 text-center">
              <Trophy className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
              <p className="text-2xl font-bold font-mono">{stats.totalExams}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Exams</p>
            </CardContent>
          </Card>
          <Card className="modern-card">
            <CardContent className="p-4 text-center">
              <Target className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
              <p className="text-2xl font-bold font-mono">{stats.avgAccuracy}%</p>
              <p className="text-[10px] text-muted-foreground uppercase">Accuracy</p>
            </CardContent>
          </Card>
          <Card className="modern-card">
            <CardContent className="p-4 text-center">
              <Clock className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
              <p className="text-2xl font-bold font-mono">{formatTime(stats.totalTime)}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Study Time</p>
            </CardContent>
          </Card>
        </div>

        {/* Edit Profile */}
        <Card className="modern-card animate-slide-up stagger-2">
          <CardHeader>
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Edit Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" className="rounded-xl h-11" />
            </div>
            <div className="space-y-2">
              <Label>Target Exam</Label>
              <Select value={targetExam} onValueChange={setTargetExam}>
                <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TARGET_EXAMS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Daily Study Goal (hours)</Label>
              <Input type="number" min={1} max={16} value={studyHoursGoal} onChange={e => setStudyHoursGoal(parseInt(e.target.value) || 1)} className="rounded-xl h-11" />
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full rounded-xl h-11 gap-2">
              <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>

        <Separator />

        <Button variant="outline" onClick={handleSignOut} className="w-full rounded-xl h-11 gap-2 text-destructive hover:text-destructive">
          <LogOut className="w-4 h-4" /> Sign Out
        </Button>
      </div>
    </div>
  );
}
