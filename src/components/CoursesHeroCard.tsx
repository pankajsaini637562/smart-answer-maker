import { Link } from 'react-router-dom';
import { ArrowRight, GraduationCap, Sparkles, PlayCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function CoursesHeroCard() {
  return (
    <Link to="/courses" className="block group">
      <Card className="relative overflow-hidden border-0 shadow-xl shadow-primary/20">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(270 80% 55%) 100%)' }} />
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -left-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
        <div className="relative p-6 md:p-8 text-primary-foreground grid md:grid-cols-[1fr_auto] items-center gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur">
              <Sparkles className="w-3.5 h-3.5" /> NEW · Learn like PW
            </div>
            <h2 className="text-2xl md:text-3xl font-bold font-display leading-tight">
              Explore Courses — Chapters, PDFs & Tests
            </h2>
            <p className="text-primary-foreground/90 max-w-lg text-sm md:text-base">
              Structured courses for Class 9–12, JEE & NEET. Free lectures, downloadable notes and OMR mock tests in one place.
            </p>
            <div className="flex items-center gap-2 pt-1 text-sm font-semibold">
              Browse the catalog
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
          <div className="hidden md:flex items-center justify-center w-32 h-32 rounded-3xl bg-white/15 backdrop-blur">
            <GraduationCap className="w-16 h-16" />
          </div>
          <div className="md:hidden flex items-center gap-2 text-xs">
            <PlayCircle className="w-4 h-4" /> Chapter-wise • Notes • Mock tests
          </div>
        </div>
      </Card>
    </Link>
  );
}
