import { supabase } from '@/integrations/supabase/client';

export type Course = {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  cover_url: string | null;
  category_id: string | null;
  instructor_id: string | null;
  instructor_name: string | null;
  subject: string | null;
  level: string | null;
  price_inr: number;
  is_free: boolean;
  is_published: boolean;
  rating_avg: number;
  rating_count: number;
  enrollment_count: number;
  created_at: string;
};

export type Category = { id: string; slug: string; name: string; icon: string | null; position: number };
export type Chapter = { id: string; course_id: string; title: string; position: number };
export type Lesson = {
  id: string;
  chapter_id: string;
  course_id: string;
  title: string;
  description: string | null;
  resource_pdf_path: string | null;
  linked_sheet_id: string | null;
  video_url: string | null;
  position: number;
  is_preview: boolean;
};

export async function fetchCategories() {
  const { data, error } = await supabase.from('course_categories').select('*').order('position');
  if (error) throw error;
  return (data ?? []) as Category[];
}

export async function fetchCourses(opts?: { categoryId?: string; search?: string; free?: boolean }) {
  let q = supabase.from('courses').select('*').eq('is_published', true).order('created_at', { ascending: false });
  if (opts?.categoryId) q = q.eq('category_id', opts.categoryId);
  if (opts?.free !== undefined) q = q.eq('is_free', opts.free);
  if (opts?.search) q = q.ilike('title', `%${opts.search}%`);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Course[];
}

export async function fetchCourse(id: string) {
  const { data, error } = await supabase.from('courses').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as Course | null;
}

export async function fetchCurriculum(courseId: string) {
  const { data: chapters, error: cErr } = await supabase
    .from('course_chapters').select('*').eq('course_id', courseId).order('position');
  if (cErr) throw cErr;
  const { data: lessons, error: lErr } = await supabase
    .from('course_lessons').select('*').eq('course_id', courseId).order('position');
  if (lErr) throw lErr;
  return { chapters: (chapters ?? []) as Chapter[], lessons: (lessons ?? []) as Lesson[] };
}

export async function fetchMyEnrollments(userId: string) {
  const { data, error } = await supabase
    .from('course_enrollments').select('course_id').eq('user_id', userId);
  if (error) throw error;
  return new Set((data ?? []).map((r: any) => r.course_id as string));
}

export async function enrollFree(courseId: string) {
  const { error } = await supabase.rpc('enroll_free_course', { _course_id: courseId });
  if (error) throw error;
}

export async function signedPdfUrl(path: string) {
  const { data, error } = await supabase.storage.from('course-content').createSignedUrl(path, 3600);
  if (error) throw error;
  return data.signedUrl;
}
