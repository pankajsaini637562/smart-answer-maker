import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { SEO } from '@/components/SEO';
import {
  ScanLine, BarChart3, Trophy, Users, Sparkles, ShieldCheck,
  Star, ArrowRight, CheckCircle2, Brain, Clock, Target
} from 'lucide-react';

const features = [
  { icon: ScanLine, title: 'AI OMR Scanner', desc: 'Snap a photo of your OMR sheet — AI detects bubbles and auto-scores instantly.' },
  { icon: BarChart3, title: 'Smart Analytics', desc: 'Topic-wise heatmaps, weak-area detection, and progress tracking across attempts.' },
  { icon: Brain, title: 'Adaptive Learning', desc: 'Personalized study suggestions powered by an AI knowledge graph.' },
  { icon: Trophy, title: 'XP & Badges', desc: '20-level gamification, daily streaks, and unlockable badges to keep you motivated.' },
  { icon: Users, title: 'Study Chat Groups', desc: 'Join public study groups, share notes, and learn together with peers.' },
  { icon: ShieldCheck, title: 'Private & Secure', desc: 'Your data stays yours. Row-level security, encrypted, never sold.' },
];

const reviews = [
  { name: 'Priya S.', role: 'NEET Aspirant', rating: 5, text: 'Scanned 50+ mock OMRs in a week. The weak-topic heatmap showed me exactly where to focus — jumped from 480 to 620 in two months.' },
  { name: 'Arjun K.', role: 'JEE Student', rating: 5, text: 'The adaptive suggestions are scary accurate. It knew I was weak in Rotational Mechanics before I did.' },
  { name: 'Ms. Verma', role: 'School Teacher', rating: 5, text: 'I check 80 OMR sheets per class in under 10 minutes. This tool gave me my evenings back.' },
  { name: 'Rohan M.', role: 'Class 12', rating: 5, text: 'Study Chat groups are a game changer. The gamification keeps my whole class hooked.' },
  { name: 'Ananya P.', role: 'NEET Repeater', rating: 5, text: 'Free, fast, and the reports look more professional than paid apps. Highly recommend.' },
  { name: 'Karan T.', role: 'JEE Mains', rating: 4, text: 'Best free OMR checker I have used. Mobile-first design, works perfectly on my phone.' },
];

const stats = [
  { value: '50K+', label: 'OMR Sheets Scanned' },
  { value: '12K+', label: 'Active Students' },
  { value: '4.8/5', label: 'Average Rating' },
  { value: '99.2%', label: 'Detection Accuracy' },
];

const faqs = [
  { q: 'Is Smart AI OMR Analysis really free?', a: 'Yes — completely free for students. Sign up, scan unlimited OMR sheets, and get full analytics without paying anything.' },
  { q: 'How accurate is the bubble detection?', a: 'Our AI engine achieves 99.2% bubble detection accuracy in good lighting. You can also review and edit any answer before submitting.' },
  { q: 'Which exams does it support?', a: 'NEET, JEE Mains, JEE Advanced, school MCQ tests, mock exams, and any custom OMR template you configure inside the app.' },
  { q: 'Do I need to install anything?', a: 'No. It works in your browser on any device. You can also install it as a PWA (Progressive Web App) for a native-app feel on Android or iOS.' },
  { q: 'Is my data safe?', a: 'Yes. We use row-level security, encrypted storage, and never share or sell student data. Your exam history is visible only to you.' },
  { q: 'Can teachers use it?', a: 'Absolutely. Many teachers use it to grade class tests in bulk. Create a sheet once, scan every student\u2019s response, and export reports.' },
  { q: 'Does it work offline?', a: 'The scanning UI works offline once cached as a PWA. Saving results to your account requires an internet connection.' },
];

const Star5 = ({ count = 5 }: { count?: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < count ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
    ))}
  </div>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Smart AI OMR Analysis — Free OMR Sheet Checker & Answer Maker"
        description="Free AI-powered OMR sheet checker. Scan answer sheets, auto-score MCQ tests, and track exam analytics for NEET, JEE, and school exams."
      />

      {/* Nav */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border/50">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white">
              <ScanLine className="w-4 h-4" />
            </div>
            <span>Smart AI OMR</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#reviews" className="hover:text-foreground">Reviews</a>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/auth"><Button variant="ghost" size="sm">Sign in</Button></Link>
            <Link to="/auth"><Button size="sm" className="gap-1">Get started <ArrowRight className="w-3.5 h-3.5" /></Button></Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10" style={{ background: 'var(--gradient-hero)' }} />
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/10 blur-3xl -z-10" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl -z-10" />

          <div className="container py-20 md:py-32 text-center max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/60 border border-border text-xs font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Trusted by 12,000+ students preparing for NEET & JEE
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-br from-foreground via-foreground to-foreground/60 bg-clip-text">
              Scan, score & master every OMR test — for free.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              The smartest answer-sheet checker for students. AI bubble detection, instant analytics,
              adaptive study suggestions, and a community of learners — all in one app.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/auth">
                <Button size="lg" className="gap-2 text-base h-12 px-6">
                  Start scanning free <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="outline" className="text-base h-12 px-6">See features</Button>
              </a>
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-success" /> No credit card</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-success" /> Unlimited scans</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-success" /> Works on mobile</span>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="container -mt-8 mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s) => (
              <Card key={s.label} className="p-6 text-center bg-card/80 backdrop-blur">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-br from-primary to-purple-500 bg-clip-text text-transparent">{s.value}</div>
                <div className="text-xs md:text-sm text-muted-foreground mt-1">{s.label}</div>
              </Card>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="container py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to ace your exams</h2>
            <p className="text-muted-foreground text-lg">From the first scan to your final rank — one app, every tool.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <Card key={f.title} className="p-6 hover:shadow-lg transition-all hover:-translate-y-1 group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="container py-20 border-t">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">From OMR sheet to report card in 30 seconds</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Target, step: '01', title: 'Create your sheet', desc: 'Configure questions, choices, marking scheme, and answer key.' },
              { icon: ScanLine, step: '02', title: 'Scan or fill bubbles', desc: 'Photograph a filled OMR or fill bubbles digitally on your phone.' },
              { icon: Clock, step: '03', title: 'Get instant analytics', desc: 'Score, accuracy, weak topics, and AI study suggestions in seconds.' },
            ].map((s) => (
              <div key={s.step} className="relative p-6 rounded-2xl border bg-card">
                <div className="absolute -top-3 left-6 px-2 py-0.5 text-xs font-bold bg-primary text-primary-foreground rounded">{s.step}</div>
                <s.icon className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Reviews */}
        <section id="reviews" className="container py-20 border-t">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Star5 />
              <span className="font-semibold">4.8 out of 5</span>
              <span className="text-muted-foreground text-sm">· 120+ reviews</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Loved by students and teachers alike</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {reviews.map((r) => (
              <Card key={r.name} className="p-6 flex flex-col gap-3">
                <Star5 count={r.rating} />
                <p className="text-sm leading-relaxed flex-1">"{r.text}"</p>
                <div className="flex items-center gap-3 pt-2 border-t">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-semibold">
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.role}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="container py-20 border-t max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently asked questions</h2>
            <p className="text-muted-foreground">Everything you need to know before getting started.</p>
          </div>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border rounded-xl px-5 bg-card">
                <AccordionTrigger className="text-left font-medium hover:no-underline">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* CTA */}
        <section className="container py-20">
          <Card className="relative overflow-hidden p-12 md:p-16 text-center border-0" style={{ background: 'var(--gradient-primary)' }}>
            <div className="absolute inset-0 bg-grid-white/5" />
            <h2 className="relative text-3xl md:text-5xl font-bold text-white mb-4">Ready to score higher?</h2>
            <p className="relative text-white/90 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of students already using Smart AI OMR to crack NEET, JEE, and school exams.
            </p>
            <Link to="/auth" className="relative inline-block">
              <Button size="lg" variant="secondary" className="text-base h-12 px-8 gap-2 font-semibold">
                Create your free account <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50">
        <div className="container py-10">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 font-bold mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white">
                  <ScanLine className="w-4 h-4" />
                </div>
                Smart AI OMR
              </div>
              <p className="text-sm text-muted-foreground">Free AI-powered OMR sheet checker for students.</p>
            </div>
            <div>
              <div className="font-semibold mb-3 text-sm">Product</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground">Features</a></li>
                <li><a href="#reviews" className="hover:text-foreground">Reviews</a></li>
                <li><Link to="/auth" className="hover:text-foreground">Sign up</Link></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-3 text-sm">Resources</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#faq" className="hover:text-foreground">FAQ</a></li>
                <li><a href="/sitemap.xml" className="hover:text-foreground">Sitemap</a></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-3 text-sm">Exams supported</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>NEET</li><li>JEE Mains & Advanced</li><li>School MCQ tests</li><li>Custom OMR</li>
              </ul>
            </div>
          </div>
          <div className="pt-6 border-t text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Smart AI OMR Analysis. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
