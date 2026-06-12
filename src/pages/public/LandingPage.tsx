import { Link } from "react-router-dom";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Sparkles, Target, BarChart3, Timer, Trophy, ScanLine, BrainCircuit, Users, ChevronRight } from "lucide-react";
import { articles } from "@/content/articles";

const features = [
  { icon: ScanLine, title: "Configurable OMR sheets", body: "Generate practice OMR sheets in seconds with any number of questions, options, and section marking schemes. Mirror the layout of NEET, JEE, CUET, CLAT, and state-level papers exactly." },
  { icon: Timer, title: "Real exam-day simulation", body: "Built-in timer, negative marking, section locks, and a distraction-free interface. Train under conditions that match the day that matters." },
  { icon: BarChart3, title: "Topic-level analytics", body: "Every attempt is broken down by topic, difficulty, time-per-question, and confidence band — so you stop guessing where your gaps are." },
  { icon: BrainCircuit, title: "Adaptive study suggestions", body: "An adaptive engine reads your accuracy trends and recommends the next chapter that will move your rank the most, not just the chapter you got most wrong." },
  { icon: Trophy, title: "Gamified progress", body: "20-level XP progression, daily streaks, and unlockable badges keep long preparation cycles motivating across the year." },
  { icon: Users, title: "Study groups & chat", body: "Form private study groups, share files, compare scores on shared papers, and learn from peers without leaving the app." },
];

export default function LandingPage() {
  return (
    <PublicLayout>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 -z-10 opacity-60" style={{ background: "var(--gradient-hero)" }} />
        <div className="container mx-auto px-4 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-6">
            <Sparkles className="w-3.5 h-3.5" /> AI-powered exam preparation
          </div>
          <h1 className="text-4xl md:text-6xl font-bold font-display tracking-tight max-w-4xl mx-auto">
            Practice smarter for <span className="gradient-text">NEET, JEE, CUET</span> and every other OMR exam
          </h1>
          <p className="text-base md:text-lg text-muted-foreground mt-5 max-w-2xl mx-auto leading-relaxed">
            Exam Master is a free, mobile-first practice companion for serious students. Generate
            OMR sheets, simulate the real test, scan your answers in seconds, and get analytics
            that actually move your rank.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link to="/auth">
              <Button size="lg" className="rounded-full gap-2 px-7">
                Start practising free <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/blog">
              <Button size="lg" variant="outline" className="rounded-full px-7">
                Read the prep blog
              </Button>
            </Link>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            No credit card. No email needed. Sign in with your name and class.
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-display">Everything you need to prepare seriously</h2>
          <p className="text-muted-foreground mt-3">
            Built around the daily workflow of a real aspirant — not a generic LMS.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(f => (
            <Card key={f.title} className="modern-card">
              <CardContent className="p-6 space-y-3">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-semibold text-lg">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-card/30 border-y border-border/60">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-display">From practice paper to insight in four steps</h2>
            <p className="text-muted-foreground mt-3">A workflow that respects your time.</p>
          </div>
          <ol className="grid md:grid-cols-4 gap-6">
            {[
              { n: "1", t: "Generate", b: "Create an OMR sheet with the exact section layout, marking scheme, and timing of your target exam." },
              { n: "2", t: "Practice", b: "Solve in a distraction-free interface with a built-in timer, mark-for-review flags, and negative marking baked in." },
              { n: "3", t: "Scan or submit", b: "Submit your answers directly, or scan a printed OMR sheet using your phone camera. Scoring is instant." },
              { n: "4", t: "Analyse", b: "Review topic-level accuracy, time-per-question, and personalised study suggestions for the next week." },
            ].map(s => (
              <li key={s.n} className="modern-card p-6">
                <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center font-mono mb-3">{s.n}</div>
                <h3 className="font-display font-semibold mb-1">{s.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.b}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* BLOG TEASER */}
      <section className="container mx-auto px-4 py-20">
        <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold font-display">Latest from the prep blog</h2>
            <p className="text-muted-foreground mt-2">Tactics, strategy, and analytics — no fluff.</p>
          </div>
          <Link to="/blog" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
            View all articles <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.slice(0, 3).map(a => (
            <Link key={a.slug} to={`/blog/${a.slug}`} className="modern-card p-6 block group">
              <div className="text-[11px] uppercase tracking-wider text-primary font-semibold mb-2">{a.tags[0]}</div>
              <h3 className="font-display font-semibold text-lg group-hover:text-primary transition-colors">{a.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{a.description}</p>
              <p className="text-xs text-muted-foreground mt-4">{a.readingMinutes} min read</p>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-card/30 border-t border-border/60">
        <div className="container mx-auto px-4 py-20 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-center mb-10">Frequently asked questions</h2>
          <div className="space-y-4">
            {[
              { q: "Is Exam Master free to use?", a: "Yes. Sign-up is free and the core features — OMR practice, scoring, analytics, study groups — are all available without any payment." },
              { q: "Which exams does it support?", a: "Any OMR-based exam, including NEET, JEE Main, CUET, CLAT, SSC, GATE, CAT, and most state-level entrance and board exams. You configure the sheet to match the paper." },
              { q: "Do I need an email to sign up?", a: "No. We use frictionless sign-in — just your name, class, school, and country. Your data is private to you and isolated by row-level security on the backend." },
              { q: "Can I use it on my phone?", a: "Yes. Exam Master is mobile-first and works in any modern mobile browser, including offline-tolerant practice mode." },
              { q: "How is my data protected?", a: "All of your attempts, profiles, and analytics are stored on Supabase with row-level security. Only you can read your own data. See our privacy policy for details." },
            ].map(f => (
              <details key={f.q} className="modern-card p-5 group">
                <summary className="font-semibold cursor-pointer flex justify-between items-center">
                  {f.q}
                  <ChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Target className="w-10 h-10 text-primary mx-auto mb-4" />
        <h2 className="text-3xl md:text-4xl font-bold font-display max-w-2xl mx-auto">
          Your next mock test is your most important coach.
        </h2>
        <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
          Start practising in under a minute. Track your trajectory across the year.
        </p>
        <Link to="/auth" className="inline-block mt-6">
          <Button size="lg" className="rounded-full gap-2 px-7">
            Create your free account <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </section>
    </PublicLayout>
  );
}
