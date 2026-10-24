import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { SEO } from '@/components/SEO';
import { PublicLayout, StartPracticeLink, guideLinks } from '@/components/PublicLayout';
import { ClipboardList, BarChart3, Brain, Timer, Trophy, Users, ArrowRight, FileDown } from 'lucide-react';

const features = [
  { icon: ClipboardList, title: 'Custom OMR tests', desc: 'Set the number of questions, options, marking scheme (including negative marking) and answer key.' },
  { icon: Timer, title: 'Timed practice', desc: 'Fill bubbles on your phone against a timer, with time recorded for each question.' },
  { icon: BarChart3, title: 'Result review', desc: 'See correct, incorrect and unanswered questions, your score and accuracy for every attempt.' },
  { icon: Brain, title: 'AI result analysis', desc: 'Get an AI-written breakdown of speed versus accuracy and tips for the questions you missed.' },
  { icon: Trophy, title: 'XP and leaderboard', desc: 'Earn XP for practice, keep a daily streak and compare progress on the public leaderboard.' },
  { icon: Users, title: 'Study groups', desc: 'Join study groups to chat and share files with other students (requires a full account).' },
];

const steps = [
  { step: '01', title: 'Create an OMR test', desc: 'Choose questions, options and marking scheme, then enter the answer key.' },
  { step: '02', title: 'Mark your responses', desc: 'Fill the bubbles in the app, or copy them from your paper practice sheet.' },
  { step: '03', title: 'Review your result', desc: 'Check your score, the questions you got wrong, and how your accuracy changes over attempts.' },
];

const faqs = [
  { q: 'What does Smart AI OMR Analysis do?', a: 'It is an online OMR checker for practice tests. You enter an answer key and your responses, and it calculates your score with the marking scheme you set and keeps a history of your attempts.' },
  { q: 'Does it scan a photo of a paper OMR sheet?', a: 'Not at the moment. You fill or copy your responses into the app. You can print our free NEET OMR practice sheet for paper practice and then enter the answers.' },
  { q: 'Is it free?', a: 'Creating tests, practising and checking results is free. Some study materials and courses in the app are paid and clearly priced.' },
  { q: 'Who is it for?', a: 'NEET aspirants practising with mock tests, and teachers or coaching institutes who want a simple way to check multiple-choice practice tests.' },
  { q: 'Is this an official NEET or NTA tool?', a: 'No. It is an independent practice tool. Always follow the official instructions and marking scheme for your actual exam.' },
  { q: 'Who can see my results?', a: 'Your exam history is linked to your account and is visible only to you. Your display name and XP appear on the public leaderboard.' },
];

export default function LandingPage() {
  return (
    <PublicLayout>
      <SEO
        title="Smart AI OMR Analysis | NEET OMR Checker Online"
        description="Check your NEET practice answers with Smart AI OMR Analysis. Create OMR-style tests, evaluate responses with an answer key, and review your results."
      />

      <section className="border-b">
        <div className="container py-16 md:py-24 text-center max-w-3xl">
          <p className="text-sm font-medium text-primary mb-4">Analyze. Evaluate. Improve.</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Online NEET OMR Checker for Practice and Answer Evaluation
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Practise your OMR workflow, submit your answers, add an answer key, and review your results in one place.
            Smart AI OMR Analysis helps students and educators organise and evaluate multiple-choice practice exams.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <StartPracticeLink>Start OMR Practice <ArrowRight className="w-4 h-4 ml-1" /></StartPracticeLink>
            <Button asChild size="lg" variant="outline">
              <Link to="/free-neet-omr-sheet-pdf"><FileDown className="w-4 h-4 mr-1" /> Download Free NEET OMR Practice Sheet</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="container py-16">
        <h2 className="text-3xl font-bold text-center mb-10">How the OMR checker works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div key={s.step} className="p-6 rounded-lg border bg-card">
              <div className="font-mono text-sm text-primary mb-2">{s.step}</div>
              <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="container py-16 border-t">
        <h2 className="text-3xl font-bold text-center mb-10">What you can do today</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <Card key={f.title} className="p-6">
              <f.icon className="w-6 h-6 text-primary mb-3" aria-hidden="true" />
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="container py-16 border-t">
        <h2 className="text-3xl font-bold text-center mb-3">Free NEET OMR guides</h2>
        <p className="text-center text-muted-foreground mb-8">Practical help for practising and checking OMR sheets.</p>
        <div className="grid md:grid-cols-3 gap-5">
          {guideLinks.map((g) => (
            <Link key={g.to} to={g.to} className="block p-6 rounded-lg border bg-card hover:border-primary transition-colors">
              <span className="font-semibold">{g.label}</span>
              <ArrowRight className="w-4 h-4 inline ml-2 text-primary" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <section id="faq" className="container py-16 border-t max-w-3xl">
        <h2 className="text-3xl font-bold text-center mb-8">Frequently asked questions</h2>
        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border rounded-lg px-5 bg-card">
              <AccordionTrigger className="text-left font-medium hover:no-underline">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="container py-16 text-center border-t">
        <h2 className="text-3xl font-bold mb-4">Ready for your next mock test?</h2>
        <p className="text-muted-foreground mb-6">Create a free account and check your first practice test.</p>
        <StartPracticeLink>Start OMR Practice</StartPracticeLink>
      </section>
    </PublicLayout>
  );
}
