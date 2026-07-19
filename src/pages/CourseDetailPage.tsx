import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BookOpen, IndianRupee, Users, Star, Lock, PlayCircle, CheckCircle2, FileText, ClipboardList } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchCourse, fetchCurriculum, enrollFree, type Course, type Chapter, type Lesson } from '@/lib/courses';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function CourseDetailPage() {
  const { id = '' } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [enrolled, setEnrolled] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchCourse(id).then(setCourse);
    fetchCurriculum(id).then(({ chapters, lessons }) => { setChapters(chapters); setLessons(lessons); });
  }, [id]);
  useEffect(() => {
    if (!user) return;
    supabase.from('course_enrollments').select('id').eq('course_id', id).eq('user_id', user.id).maybeSingle()
      .then(({ data }) => setEnrolled(!!data));
  }, [id, user]);

  const handleEnroll = async () => {
    if (!user) { nav(`/auth?next=/courses/${id}`); return; }
    if (!course) return;
    setBusy(true);
    try {
      if (course.is_free) {
        await enrollFree(course.id);
        setEnrolled(true);
        toast.success('Enrolled! Start learning now.');
      } else {
        toast.info('Paid checkout will activate once payments are enabled by the admin.');
      }
    } catch (e: any) { toast.error(e.message || 'Enrollment failed'); }
    setBusy(false);
  };

  if (!course) return <div className="min-h-screen bg-background"><AppHeader /><main className="container py-10 text-muted-foreground">Loading...</main></div>;

  const lessonsByChapter = (chId: string) => lessons.filter(l => l.chapter_id === chId).sort((a, b) => a.position - b.position);

  return (
    <div className="min-h-screen bg-background">
      <SEO title={`${course.title} | Courses`} description={course.description?.slice(0, 150) || course.title} />
      <AppHeader />
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0" style={{ background: 'var(--gradient-hero)' }} />
        <div className="container relative py-8 grid md:grid-cols-[1fr_360px] gap-8">
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold font-display">{course.title}</h1>
            {course.description && <p className="text-muted-foreground">{course.description}</p>}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              {course.instructor_name && <span>by <b>{course.instructor_name}</b></span>}
              {course.subject && <Badge variant="secondary">{course.subject}</Badge>}
              {course.level && <Badge variant="outline">{course.level}</Badge>}
              <span className="flex items-center gap-1 text-muted-foreground"><Users className="w-4 h-4" />{course.enrollment_count} enrolled</span>
              {course.rating_count > 0 && <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-amber-400 text-amber-400" />{course.rating_avg.toFixed(1)}</span>}
            </div>
          </div>
          <Card className="modern-card">
            <div className="aspect-video bg-gradient-to-br from-primary/25 to-purple-500/10 flex items-center justify-center">
              {course.cover_url ? <img src={course.cover_url} alt={course.title} className="w-full h-full object-cover" />
                : <BookOpen className="w-12 h-12 text-primary/70" />}
            </div>
            <CardContent className="p-5 space-y-3">
              {course.is_free
                ? <p className="text-2xl font-bold text-emerald-500">Free</p>
                : <p className="text-2xl font-bold flex items-center"><IndianRupee className="w-6 h-6" />{course.price_inr}</p>}
              {enrolled ? (
                <Link to={`/courses/${course.id}/learn`}><Button className="w-full gap-2"><PlayCircle className="w-4 h-4" />Continue learning</Button></Link>
              ) : (
                <Button className="w-full" onClick={handleEnroll} disabled={busy}>
                  {busy ? 'Please wait…' : course.is_free ? 'Enroll for Free' : 'Buy this course'}
                </Button>
              )}
              <ul className="text-sm text-muted-foreground space-y-1 pt-2">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" />{chapters.length} chapters, {lessons.length} lessons</li>
                <li className="flex items-center gap-2"><FileText className="w-4 h-4 text-primary" />Downloadable PDF notes</li>
                <li className="flex items-center gap-2"><ClipboardList className="w-4 h-4 text-primary" />OMR mock tests included</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>
      <main className="container py-8">
        <Tabs defaultValue="curriculum">
          <TabsList>
            <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>
          <TabsContent value="curriculum" className="space-y-4 pt-4">
            {chapters.length === 0 ? <p className="text-muted-foreground">Curriculum coming soon.</p> :
              chapters.sort((a,b)=>a.position-b.position).map((ch, i) => (
                <Card key={ch.id} className="modern-card">
                  <CardContent className="p-4">
                    <h3 className="font-semibold font-display mb-3">Chapter {i+1}: {ch.title}</h3>
                    <ul className="space-y-1.5">
                      {lessonsByChapter(ch.id).map(l => (
                        <li key={l.id} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0">
                          <span className="flex items-center gap-2">
                            {enrolled || l.is_preview ? <PlayCircle className="w-4 h-4 text-primary" /> : <Lock className="w-4 h-4 text-muted-foreground" />}
                            {l.title}
                          </span>
                          {l.is_preview && !enrolled && <Badge variant="secondary" className="text-[10px]">Preview</Badge>}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
          <TabsContent value="overview" className="pt-4">
            <Card className="modern-card"><CardContent className="p-6 prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
              {course.description || 'No overview provided.'}
            </CardContent></Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
