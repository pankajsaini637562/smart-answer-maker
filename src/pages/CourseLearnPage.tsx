import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, PlayCircle, FileText, ClipboardList, CheckCircle2, Circle, Download } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { fetchCourse, fetchCurriculum, signedPdfUrl, type Course, type Chapter, type Lesson } from '@/lib/courses';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function CourseLearnPage() {
  const { id = '' } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [active, setActive] = useState<Lesson | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) { nav(`/auth?next=/courses/${id}/learn`); return; }
    supabase.from('course_enrollments').select('id').eq('course_id', id).eq('user_id', user.id).maybeSingle()
      .then(({ data }) => { if (!data) { toast.error('Enroll to access this course'); nav(`/courses/${id}`); } });
    fetchCourse(id).then(setCourse);
    fetchCurriculum(id).then(({ chapters, lessons }) => {
      setChapters(chapters.sort((a,b)=>a.position-b.position));
      setLessons(lessons.sort((a,b)=>a.position-b.position));
      if (lessons.length) setActive(lessons[0]);
    });
    supabase.from('course_lesson_progress').select('lesson_id').eq('user_id', user.id).eq('course_id', id)
      .then(({ data }) => setCompleted(new Set((data ?? []).map((r: any) => r.lesson_id))));
  }, [id, user, nav]);

  const toggleComplete = async () => {
    if (!active || !user) return;
    if (completed.has(active.id)) {
      await supabase.from('course_lesson_progress').delete().eq('user_id', user.id).eq('lesson_id', active.id);
      const next = new Set(completed); next.delete(active.id); setCompleted(next);
    } else {
      await supabase.from('course_lesson_progress').insert({ user_id: user.id, lesson_id: active.id, course_id: id });
      setCompleted(new Set([...completed, active.id]));
    }
  };

  const openPdf = async () => {
    if (!active?.resource_pdf_path) return;
    try { window.open(await signedPdfUrl(active.resource_pdf_path), '_blank'); }
    catch (e: any) { toast.error(e.message || 'Failed to open PDF'); }
  };

  if (!course) return <div className="min-h-screen bg-background"><AppHeader /><main className="container py-10">Loading...</main></div>;

  return (
    <div className="min-h-screen bg-background">
      <SEO title={`${course.title} — Learn`} description={course.title} />
      <AppHeader />
      <main className="container py-6 grid lg:grid-cols-[320px_1fr] gap-6">
        <aside className="space-y-3">
          <Link to={`/courses/${id}`} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"><ArrowLeft className="w-4 h-4" />Back to course</Link>
          <h2 className="font-semibold font-display">{course.title}</h2>
          <div className="space-y-3">
            {chapters.map((ch, i) => (
              <div key={ch.id}>
                <p className="text-xs font-semibold text-muted-foreground mb-1.5">Ch {i+1}. {ch.title}</p>
                <ul className="space-y-1">
                  {lessons.filter(l => l.chapter_id === ch.id).map(l => (
                    <li key={l.id}>
                      <button onClick={() => setActive(l)}
                        className={cn('w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm transition-colors',
                          active?.id === l.id ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50')}>
                        {completed.has(l.id) ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <Circle className="w-4 h-4 text-muted-foreground shrink-0" />}
                        <span className="truncate">{l.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>
        <section>
          {active ? (
            <Card className="modern-card">
              <CardContent className="p-6 space-y-4">
                <h1 className="text-2xl font-bold font-display">{active.title}</h1>
                {active.video_url && (
                  <div className="aspect-video rounded-xl overflow-hidden bg-black">
                    <iframe src={active.video_url} className="w-full h-full" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
                  </div>
                )}
                {active.description && <p className="text-muted-foreground whitespace-pre-wrap">{active.description}</p>}
                <div className="flex flex-wrap gap-2 pt-2">
                  {active.resource_pdf_path && (
                    <Button variant="outline" onClick={openPdf} className="gap-2"><Download className="w-4 h-4" />Download notes (PDF)</Button>
                  )}
                  {active.linked_sheet_id && (
                    <Link to={`/exam/${active.linked_sheet_id}`}>
                      <Button variant="outline" className="gap-2"><ClipboardList className="w-4 h-4" />Take mock test</Button>
                    </Link>
                  )}
                  <Button onClick={toggleComplete} variant={completed.has(active.id) ? 'secondary' : 'default'} className="gap-2">
                    {completed.has(active.id) ? <><CheckCircle2 className="w-4 h-4" />Completed</> : <><PlayCircle className="w-4 h-4" />Mark complete</>}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : <p className="text-muted-foreground">No lessons yet.</p>}
        </section>
      </main>
    </div>
  );
}
