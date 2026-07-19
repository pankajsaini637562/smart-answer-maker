import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, Upload, ChevronDown, ChevronRight, FileText, GraduationCap } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useIsInstructor } from '@/hooks/useIsInstructor';
import { supabase } from '@/integrations/supabase/client';
import { fetchCategories, fetchCurriculum, type Category, type Chapter, type Lesson } from '@/lib/courses';
import { toast } from 'sonner';

export default function InstructorPage() {
  const { user } = useAuth();
  const { isInstructor, loading } = useIsInstructor();
  const nav = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState<any>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [openCh, setOpenCh] = useState<Set<string>>(new Set());

  useEffect(() => { if (!loading && !isInstructor) nav('/'); }, [loading, isInstructor, nav]);
  useEffect(() => { fetchCategories().then(setCategories); }, []);
  useEffect(() => { if (user) reloadCourses(); }, [user]);
  useEffect(() => { if (selectedId) loadCourse(selectedId); }, [selectedId]);

  const reloadCourses = async () => {
    const { data } = await supabase.from('courses').select('*').eq('instructor_id', user!.id).order('created_at', { ascending: false });
    setCourses(data ?? []);
  };
  const loadCourse = async (id: string) => {
    const { data } = await supabase.from('courses').select('*').eq('id', id).maybeSingle();
    setEditing(data);
    const c = await fetchCurriculum(id);
    setChapters(c.chapters.sort((a,b)=>a.position-b.position));
    setLessons(c.lessons.sort((a,b)=>a.position-b.position));
  };

  const createCourse = async () => {
    const { data, error } = await supabase.from('courses').insert({
      title: 'Untitled course', instructor_id: user!.id,
      instructor_name: (user!.user_metadata as any)?.display_name || 'Instructor',
      price_inr: 0, is_free: true, is_published: false,
    }).select().single();
    if (error) return toast.error(error.message);
    toast.success('Course created');
    await reloadCourses();
    setSelectedId(data.id);
  };
  const saveCourse = async () => {
    if (!editing) return;
    const { id, ...rest } = editing;
    const { error } = await supabase.from('courses').update(rest).eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('Saved');
    reloadCourses();
  };
  const deleteCourse = async (id: string) => {
    if (!confirm('Delete this course and all its content?')) return;
    await supabase.from('courses').delete().eq('id', id);
    setSelectedId(null); setEditing(null); reloadCourses();
  };
  const addChapter = async () => {
    const { data, error } = await supabase.from('course_chapters').insert({
      course_id: selectedId, title: 'New chapter', position: chapters.length,
    }).select().single();
    if (error) return toast.error(error.message);
    setChapters([...chapters, data as Chapter]);
  };
  const updateChapter = async (ch: Chapter) => {
    await supabase.from('course_chapters').update({ title: ch.title, position: ch.position }).eq('id', ch.id);
  };
  const delChapter = async (id: string) => {
    if (!confirm('Delete chapter and its lessons?')) return;
    await supabase.from('course_chapters').delete().eq('id', id);
    setChapters(chapters.filter(c => c.id !== id));
    setLessons(lessons.filter(l => l.chapter_id !== id));
  };
  const addLesson = async (chapterId: string) => {
    const chLessons = lessons.filter(l => l.chapter_id === chapterId);
    const { data, error } = await supabase.from('course_lessons').insert({
      chapter_id: chapterId, course_id: selectedId, title: 'New lesson', position: chLessons.length,
    }).select().single();
    if (error) return toast.error(error.message);
    setLessons([...lessons, data as Lesson]);
  };
  const updateLesson = async (l: Lesson) => {
    const { id, ...rest } = l;
    await supabase.from('course_lessons').update(rest).eq('id', id);
    setLessons(lessons.map(x => x.id === id ? l : x));
  };
  const delLesson = async (id: string) => {
    await supabase.from('course_lessons').delete().eq('id', id);
    setLessons(lessons.filter(l => l.id !== id));
  };
  const uploadPdf = async (l: Lesson, file: File) => {
    if (file.type !== 'application/pdf') return toast.error('Only PDF files');
    const path = `${l.course_id}/${l.id}/${Date.now()}.pdf`;
    const { error } = await supabase.storage.from('course-content').upload(path, file, { upsert: true, contentType: 'application/pdf' });
    if (error) return toast.error(error.message);
    await updateLesson({ ...l, resource_pdf_path: path });
    toast.success('PDF uploaded');
  };
  const toggleOpen = (id: string) => { const n = new Set(openCh); n.has(id) ? n.delete(id) : n.add(id); setOpenCh(n); };

  if (loading) return <div className="min-h-screen bg-background"><AppHeader /><main className="container py-10">Loading...</main></div>;

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Instructor Dashboard" description="Create and manage your courses." />
      <AppHeader />
      <main className="container py-6 grid lg:grid-cols-[300px_1fr] gap-6">
        <aside className="space-y-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            <h2 className="font-semibold font-display">My Courses</h2>
          </div>
          <Button onClick={createCourse} className="w-full gap-2" size="sm"><Plus className="w-4 h-4" />New course</Button>
          <div className="space-y-1">
            {courses.map(c => (
              <button key={c.id} onClick={() => setSelectedId(c.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm truncate ${selectedId === c.id ? 'bg-accent' : 'hover:bg-accent/50'}`}>
                {c.title} {!c.is_published && <span className="text-[10px] text-muted-foreground">(draft)</span>}
              </button>
            ))}
            {courses.length === 0 && <p className="text-xs text-muted-foreground px-2">No courses yet.</p>}
          </div>
        </aside>
        <section className="space-y-6">
          {!editing ? (
            <Card className="modern-card"><CardContent className="p-10 text-center text-muted-foreground">Select or create a course to edit.</CardContent></Card>
          ) : (
            <>
              <Card className="modern-card">
                <CardHeader className="flex-row justify-between items-center">
                  <CardTitle className="font-display">Course details</CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="destructive" onClick={() => deleteCourse(editing.id)}><Trash2 className="w-4 h-4" /></Button>
                    <Button size="sm" onClick={saveCourse} className="gap-1"><Save className="w-4 h-4" />Save</Button>
                  </div>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2"><Label>Title</Label><Input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} /></div>
                  <div className="md:col-span-2"><Label>Description</Label><Textarea rows={4} value={editing.description || ''} onChange={e => setEditing({ ...editing, description: e.target.value })} /></div>
                  <div><Label>Cover image URL</Label><Input value={editing.cover_url || ''} onChange={e => setEditing({ ...editing, cover_url: e.target.value })} placeholder="https://..." /></div>
                  <div><Label>Category</Label>
                    <Select value={editing.category_id || ''} onValueChange={v => setEditing({ ...editing, category_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Choose" /></SelectTrigger>
                      <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Subject</Label><Input value={editing.subject || ''} onChange={e => setEditing({ ...editing, subject: e.target.value })} /></div>
                  <div><Label>Level</Label><Input value={editing.level || ''} onChange={e => setEditing({ ...editing, level: e.target.value })} placeholder="Beginner / Advanced" /></div>
                  <div><Label>Price (INR)</Label><Input type="number" value={editing.price_inr} onChange={e => setEditing({ ...editing, price_inr: Number(e.target.value) })} disabled={editing.is_free} /></div>
                  <div className="flex items-center gap-6 pt-6">
                    <div className="flex items-center gap-2"><Switch checked={editing.is_free} onCheckedChange={v => setEditing({ ...editing, is_free: v, price_inr: v ? 0 : editing.price_inr })} /><Label>Free</Label></div>
                    <div className="flex items-center gap-2"><Switch checked={editing.is_published} onCheckedChange={v => setEditing({ ...editing, is_published: v })} /><Label>Published</Label></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="modern-card">
                <CardHeader className="flex-row justify-between items-center">
                  <CardTitle className="font-display">Curriculum</CardTitle>
                  <Button size="sm" onClick={addChapter} className="gap-1"><Plus className="w-4 h-4" />Chapter</Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {chapters.map((ch, i) => (
                    <div key={ch.id} className="border rounded-xl p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleOpen(ch.id)}>{openCh.has(ch.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}</button>
                        <Input value={ch.title} onChange={e => setChapters(chapters.map(c => c.id === ch.id ? { ...c, title: e.target.value } : c))}
                          onBlur={() => updateChapter(ch)} className="flex-1" placeholder={`Chapter ${i+1}`} />
                        <Button size="sm" variant="ghost" onClick={() => addLesson(ch.id)}><Plus className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => delChapter(ch.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                      {openCh.has(ch.id) && (
                        <div className="pl-6 space-y-2">
                          {lessons.filter(l => l.chapter_id === ch.id).map(l => (
                            <div key={l.id} className="border rounded-lg p-2 space-y-2 bg-accent/20">
                              <div className="flex items-center gap-2">
                                <Input value={l.title} onChange={e => setLessons(lessons.map(x => x.id === l.id ? { ...x, title: e.target.value } : x))}
                                  onBlur={() => updateLesson(lessons.find(x => x.id === l.id)!)} />
                                <Button size="sm" variant="ghost" onClick={() => delLesson(l.id)}><Trash2 className="w-4 h-4" /></Button>
                              </div>
                              <Textarea rows={2} placeholder="Lesson description" value={l.description || ''}
                                onChange={e => setLessons(lessons.map(x => x.id === l.id ? { ...x, description: e.target.value } : x))}
                                onBlur={() => updateLesson(lessons.find(x => x.id === l.id)!)} />
                              <Input placeholder="Video URL (YouTube embed etc.)" value={l.video_url || ''}
                                onChange={e => setLessons(lessons.map(x => x.id === l.id ? { ...x, video_url: e.target.value } : x))}
                                onBlur={() => updateLesson(lessons.find(x => x.id === l.id)!)} />
                              <div className="flex items-center gap-3 flex-wrap text-xs">
                                <label className="cursor-pointer flex items-center gap-1 text-primary">
                                  <Upload className="w-3.5 h-3.5" /> {l.resource_pdf_path ? 'Replace PDF' : 'Upload PDF'}
                                  <input type="file" accept="application/pdf" className="hidden" onChange={e => e.target.files?.[0] && uploadPdf(l, e.target.files[0])} />
                                </label>
                                {l.resource_pdf_path && <span className="flex items-center gap-1 text-muted-foreground"><FileText className="w-3 h-3" />PDF attached</span>}
                                <label className="flex items-center gap-1"><Switch checked={l.is_preview} onCheckedChange={v => { const nl = { ...l, is_preview: v }; updateLesson(nl); }} />Preview</label>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {chapters.length === 0 && <p className="text-sm text-muted-foreground">No chapters yet.</p>}
                </CardContent>
              </Card>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
