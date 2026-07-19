import { Link } from 'react-router-dom';
import { BookOpen, IndianRupee, Star, Users, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Course } from '@/lib/courses';

export function CourseCard({ course, enrolled }: { course: Course; enrolled?: boolean }) {
  return (
    <Link to={`/courses/${course.id}`} className="block group">
      <Card className="modern-card overflow-hidden h-full transition-transform group-hover:-translate-y-0.5">
        <div className="aspect-video relative bg-gradient-to-br from-primary/25 to-purple-500/10 flex items-center justify-center">
          {course.cover_url ? (
            <img src={course.cover_url} alt={course.title} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <BookOpen className="w-12 h-12 text-primary/70" />
          )}
          <div className="absolute top-2 right-2 flex gap-1">
            {enrolled && <Badge className="bg-emerald-500/90 text-white border-0 gap-1"><CheckCircle2 className="w-3 h-3" />Enrolled</Badge>}
            {course.is_free
              ? <Badge className="bg-emerald-500/90 text-white border-0">Free</Badge>
              : <Badge className="bg-primary text-primary-foreground border-0 flex items-center gap-0.5"><IndianRupee className="w-3 h-3" />{course.price_inr}</Badge>}
          </div>
        </div>
        <CardContent className="p-3 space-y-2">
          <h3 className="font-semibold font-display leading-tight line-clamp-2">{course.title}</h3>
          {course.instructor_name && <p className="text-xs text-muted-foreground truncate">by {course.instructor_name}</p>}
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            {course.rating_count > 0 && (
              <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{course.rating_avg.toFixed(1)}</span>
            )}
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{course.enrollment_count}</span>
            {course.subject && <span className="truncate">• {course.subject}</span>}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
