import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, GraduationCap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const CLASSES = ['6th', '7th', '8th', '9th', '10th', '11th', '12th', 'Dropper', 'College'];
const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'United Arab Emirates',
  'Singapore', 'Nepal', 'Bangladesh', 'Pakistan', 'Sri Lanka', 'Saudi Arabia', 'Qatar',
  'Germany', 'France', 'Netherlands', 'South Africa', 'Nigeria', 'Kenya', 'Malaysia',
  'Indonesia', 'Philippines', 'Japan', 'South Korea', 'China', 'Brazil', 'Mexico', 'Other'
];

export default function AuthPage() {
  const { signInAnonymously } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [country, setCountry] = useState('');
  const [school, setSchool] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Please enter your name'); return; }
    if (!studentClass) { toast.error('Please select your class'); return; }
    if (!country) { toast.error('Please select your country'); return; }
    setLoading(true);
    const { error } = await signInAnonymously(name.trim(), studentClass, country, school.trim(), phone.trim());
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Welcome, ${name}! 🎉`);
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
          <CardHeader className="text-center pb-2">
            <CardTitle className="font-display flex items-center justify-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" /> Get Started
            </CardTitle>
            <CardDescription>Enter your details to begin</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="rounded-xl h-11"
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="class">Class *</Label>
                <Select value={studentClass} onValueChange={setStudentClass}>
                  <SelectTrigger className="rounded-xl h-11">
                    <SelectValue placeholder="Select your class" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="school">School / Institute (optional)</Label>
                <Input
                  id="school"
                  placeholder="e.g. Delhi Public School"
                  value={school}
                  onChange={e => setSchool(e.target.value)}
                  className="rounded-xl h-11"
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="rounded-xl h-11"
                  maxLength={15}
                />
              </div>

              <Button type="submit" className="w-full rounded-xl h-11 gap-2" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GraduationCap className="w-4 h-4" />}
                {loading ? 'Setting up…' : 'Start Learning'}
              </Button>

              <p className="text-[11px] text-muted-foreground text-center">
                No email or password needed. Just enter your details and go!
              </p>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
}
