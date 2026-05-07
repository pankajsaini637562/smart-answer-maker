import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, User, Save, LogOut, Target, Clock, Trophy, Loader2, GraduationCap, School, Phone, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { AppHeader } from '@/components/AppHeader';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const TARGET_EXAMS = ['NEET', 'JEE Main', 'JEE Advanced', 'UPSC', 'SSC', 'GATE', 'CAT', 'CLAT', 'CUET', 'Board Exams', 'Other'];
const CLASSES = ['6th', '7th', '8th', '9th', '10th', '11th', '12th', 'Dropper', 'College'];

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [school, setSchool] = useState('');
  const [phone, setPhone] = useState('');
  const [targetExam, setTargetExam] = useState('NEET');
  const [studyHoursGoal, setStudyHoursGoal] = useState(4);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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
      setStudentClass((data as any).class || '');
      setSchool((data as any).school || '');
      setPhone((data as any).phone || '');
      setTargetExam(data.target_exam || 'NEET');
      setStudyHoursGoal(data.study_hours_goal || 4);
      setAvatarUrl((data as any).avatar_url || '');
    }
    setLoading(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2 MB'); return; }
    setUploadingAvatar(true);
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (upErr) { toast.error(upErr.message); setUploadingAvatar(false); return; }
    const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
    const url = pub.publicUrl;
    const { error } = await supabase.from('profiles').update({ avatar_url: url, updated_at: new Date().toISOString() }).eq('id', user.id);
    setUploadingAvatar(false);
    if (error) { toast.error(error.message); return; }
    setAvatarUrl(url);
    toast.success('Avatar updated!');
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
      class: studentClass,
      school,
      phone,
      target_exam: targetExam,
      study_hours_goal: studyHoursGoal,
      updated_at: new Date().toISOString(),
    } as any).eq('id', user.id);
    setSaving(false);
    if (error) { toast.error('Failed to save'); return; }
    toast.success('Profile updated!');
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
  };

  const initials = displayName ? displayName.slice(0, 2).toUpperCase() : 'ST';
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
            <p className="text-sm text-muted-foreground">{displayName || 'Student'} • {studentClass || 'N/A'}</p>
          </div>
        </div>

        {/* Avatar & Name */}
        <Card className="modern-card animate-slide-up">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-4">
              <label className="relative cursor-pointer group/avatar">
                <Avatar className="w-16 h-16">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
                  <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">{initials}</AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity">
                  {uploadingAvatar ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Camera className="w-5 h-5 text-white" />}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
              </label>
              <div className="flex-1">
                <CardTitle className="font-display">{displayName || 'Student'}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5" /> {studentClass || 'Not set'}
                  {school && <><span>•</span><School className="w-3.5 h-3.5" /> {school}</>}
                </CardDescription>
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
              <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" className="rounded-xl h-11" maxLength={50} />
            </div>
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={studentClass} onValueChange={setStudentClass}>
                <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>School / Institute</Label>
              <Input value={school} onChange={e => setSchool(e.target.value)} placeholder="Your school" className="rounded-xl h-11" maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number" className="rounded-xl h-11" maxLength={15} />
            </div>

            <Separator />

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
