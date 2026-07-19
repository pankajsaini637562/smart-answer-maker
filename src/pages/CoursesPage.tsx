import { useEffect, useMemo, useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { SEO } from '@/components/SEO';
import { CourseCard } from '@/components/CourseCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { fetchCategories, fetchCourses, fetchMyEnrollments, type Category, type Course } from '@/lib/courses';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export default function CoursesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolled, setEnrolled] = useState<Set<string>>(new Set());
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'all' | 'free' | 'enrolled'>(() =>
    new URLSearchParams(window.location.search).get('tab') === 'enrolled' ? 'enrolled' : 'all');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchCategories().then(setCategories).catch(() => {}); }, []);
  useEffect(() => { if (user) fetchMyEnrollments(user.id).then(setEnrolled).catch(() => {}); }, [user]);
  useEffect(() => {
    setLoading(true);
    fetchCourses({ categoryId: activeCat ?? undefined, search: search || undefined, free: tab === 'free' ? true : undefined })
      .then(setCourses).finally(() => setLoading(false));
  }, [activeCat, search, tab]);

  const visible = useMemo(() => tab === 'enrolled' ? courses.filter(c => enrolled.has(c.id)) : courses, [tab, courses, enrolled]);

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Courses | Smart AI OMR Analysis" description="Explore structured video and PDF courses for Class 9–12, JEE, and NEET with mock tests." />
      <AppHeader />
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0" style={{ background: 'var(--gradient-hero)' }} />
        <div className="container relative py-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Sparkles className="w-3.5 h-3.5" /> Courses
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-display">Learn from structured courses</h1>
          <p className="text-muted-foreground max-w-xl">Chapters, downloadable notes and mock tests — from top instructors.</p>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {(['all', 'free', 'enrolled'] as const).map(t => (
              <Button key={t} size="sm" variant={tab === t ? 'default' : 'outline'} onClick={() => setTab(t)} className="rounded-full capitalize">
                {t === 'enrolled' ? 'My Courses' : t}
              </Button>
            ))}
          </div>
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses..." className="pl-9 rounded-xl" />
          </div>
        </div>
      </section>
      <main className="container py-8 space-y-6">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setActiveCat(null)}
            className={cn('px-3 py-1.5 rounded-full text-sm border', !activeCat ? 'bg-primary text-primary-foreground border-primary' : 'bg-card')}>
            All
          </button>
          {categories.map(c => (
            <button key={c.id} onClick={() => setActiveCat(c.id)}
              className={cn('px-3 py-1.5 rounded-full text-sm border', activeCat === c.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-card')}>
              {c.name}
            </button>
          ))}
        </div>
        {loading ? <p className="text-muted-foreground">Loading...</p>
          : visible.length === 0 ? <p className="text-muted-foreground py-12 text-center">No courses found.</p>
          : <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {visible.map(c => <CourseCard key={c.id} course={c} enrolled={enrolled.has(c.id)} />)}
            </div>}
      </main>
    </div>
  );
}
