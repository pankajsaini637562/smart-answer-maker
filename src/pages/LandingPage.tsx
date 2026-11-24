import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SEO } from '@/components/SEO';
import { HOME_DESCRIPTION, HOME_TITLE } from '@/lib/site';
import { PublicLayout, StartPracticeLink, guideLinks } from '@/components/PublicLayout';
import { ClipboardList, BarChart3, Brain, Timer, Trophy, Users, ArrowRight, FileDown } from 'lucide-react';

const features = [
  { icon: ClipboardList, title: 'Custom OMR tests', desc: 'Set the number of questions, four or five options, marks per question, negative marking, subject, and answer key.' },
  { icon: Timer, title: 'Timed practice', desc: 'Fill bubbles on your phone against a timer, with time recorded for each question.' },
  { icon: BarChart3, title: 'Subject-wise results', desc: 'Review correct, incorrect, and unanswered questions alongside your score and accuracy for every subject and attempt.' },
  { icon: Brain, title: 'AI result analysis', desc: 'Get an AI-written breakdown of speed versus accuracy and tips for the questions you missed.' },
  { icon: Trophy, title: 'XP and leaderboard', desc: 'Earn XP for practice, keep a daily streak, and compare progress on the public leaderboard.' },
  { icon: Users, title: 'Study groups', desc: 'Join study groups to chat and share files with other students (requires a full account).' },
];

const steps = [
  { step: '01', title: 'Create your practice test', desc: 'Choose the question count, options, subject, time limit, and marking scheme, then enter the answer key.' },
  { step: '02', title: 'Enter your OMR responses', desc: 'Fill the bubbles in the app or copy the responses from your paper practice sheet.' },
  { step: '03', title: 'Get your score instantly', desc: 'See correct, incorrect, and blank answers, negative marking, accuracy, and subject-wise performance insights.' },
];

const examUses = [
  { title: 'NTA NEET UG practice', desc: 'Print the free 180-question practice sheet or create a custom test with the familiar +4 and -1 marking scheme.' },
  { title: 'JEE Main & Advanced mock review', desc: 'Use configurable multiple-choice practice sheets, timers, and answer keys to review OMR-style coaching mocks.' },
  { title: 'CUET & coaching test series', desc: 'Adapt subjects, four or five options, marks, deductions, and timing to your institute’s practice paper.' },
];

const faqs = [
  {
    q: 'How do I check my NEET or JEE OMR sheet online using AI?',
    a: 'Create a free practice test, enter or import your answer key, and mark your responses on the digital OMR sheet. After you submit, the app calculates your score immediately and its AI analysis explains accuracy, speed, and areas to improve.',
  },
  {
    q: 'Is Smart AI OMR Analysis free for students?',
    a: 'Yes. Creating OMR practice tests, entering responses, and checking results is free. Some optional study materials and courses are paid and are clearly priced before purchase.',
  },
  {
    q: 'Does the OMR checker calculate negative marking (+4 and -1) automatically?',
    a: 'Yes. Set +4 marks for each correct answer and a -1 deduction for each incorrect answer when creating a NEET-style test. The checker applies your selected scheme automatically, and you can also choose different marks or disable negative marking for other tests.',
  },
  {
    q: 'Can I scan a photo of my OMR sheet taken from my mobile phone?',
    a: 'Not at present. The current checker does not read uploaded sheet photos. You fill the bubbles in the app or copy responses from your paper sheet, then review them before submission. A free printable NEET practice sheet is available for this workflow.',
  },
  {
    q: 'Which exams are supported by Smart AI OMR Analysis?',
    a: 'The configurable multiple-choice workflow supports practice for NEET UG, JEE Main, JEE Advanced, CUET, and coaching test series. Smart AI OMR Analysis is an independent practice tool, not an official NTA interface; JEE and CUET are computer-based exams, so the OMR-style sheets are for mock practice and answer review.',
  },
];

export default function LandingPage() {
  return (
    <PublicLayout>
      <SEO title={HOME_TITLE} description={HOME_DESCRIPTION} />

      <section className="border-b">
        <div className="container py-16 md:py-24 text-center max-w-4xl">
          <p className="text-sm font-medium text-primary mb-4">Analyze. Evaluate. Improve.</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Smart AI OMR Analysis: Instant Online OMR Sheet Checker for NEET &amp; JEE
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
            Enter your answer key and responses to check NEET, JEE Main, JEE Advanced, CUET, and coaching mock tests online.
            Get instant scores, automatic negative marking, accuracy insights, and subject-wise performance analysis in one place.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <StartPracticeLink>Check My OMR Responses <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" /></StartPracticeLink>
            <Button asChild size="lg" variant="outline">
              <Link to="/free-neet-omr-sheet-pdf"><FileDown className="w-4 h-4 mr-1" aria-hidden="true" /> Download Free NEET OMR Practice Sheet</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="container py-16">
        <h2 className="text-3xl font-bold text-center mb-4">How to Check Your NEET &amp; JEE OMR Sheet Online in Seconds</h2>
        <p className="text-center text-muted-foreground max-w-3xl mx-auto mb-10">
          Turn your answer key and marked responses into a clear practice-test result in three straightforward steps.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((s) => (
            <article key={s.step} className="p-6 rounded-lg border bg-card">
              <div className="font-mono text-sm text-primary mb-2">{s.step}</div>
              <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="features" className="container py-16 border-t">
        <h2 className="text-3xl font-bold text-center mb-4">Accurate +4 / -1 Negative Marking &amp; Subject-Wise Score Analysis</h2>
        <p className="text-center text-muted-foreground max-w-3xl mx-auto mb-10">
          Use the NEET-style +4 and -1 scheme or customize the marks for another test. Every submission applies your rules automatically and separates results by subject for focused revision.
        </p>
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

      <section id="supported-exams" className="container py-16 border-t">
        <h2 className="text-3xl font-bold text-center mb-4">Compatible with NTA NEET UG, JEE Main, CUET &amp; Coaching Test Series</h2>
        <p className="text-center text-muted-foreground max-w-3xl mx-auto mb-10">
          Configure the sheet around your practice paper instead of adapting your revision to a fixed template. This independent tool is not affiliated with NTA; JEE and CUET are computer-based exams, and the OMR-style workflow is intended for mock practice and answer review.
        </p>
        <div className="grid md:grid-cols-3 gap-5">
          {examUses.map((exam) => (
            <article key={exam.title} className="p-6 rounded-lg border bg-card">
              <h3 className="font-semibold text-lg mb-2">{exam.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{exam.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container py-16 border-t">
        <h2 className="text-3xl font-bold text-center mb-3">Free NEET &amp; JEE OMR Practice Guides</h2>
        <p className="text-center text-muted-foreground mb-8">Practical help for marking, checking, and avoiding mistakes in OMR-style mock tests.</p>
        <div className="grid md:grid-cols-3 gap-5">
          {guideLinks.map((g) => (
            <article key={g.to}>
              <Link to={g.to} className="block p-6 rounded-lg border bg-card hover:border-primary transition-colors">
                <span className="font-semibold">{g.label}</span>
                <ArrowRight className="w-4 h-4 inline ml-2 text-primary" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section id="faq" className="container py-16 border-t max-w-3xl" aria-labelledby="homepage-faq-heading">
        <h2 id="homepage-faq-heading" className="text-3xl font-bold text-center mb-3">NEET &amp; JEE OMR Checker: Frequently Asked Questions</h2>
        <p className="text-center text-muted-foreground mb-8">Clear answers about online checking, free access, negative marking, photo scanning, and supported exams.</p>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <article key={faq.q} className="border rounded-lg p-5 bg-card">
              <h3 className="font-semibold text-lg mb-2">{faq.q}</h3>
              <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container py-16 text-center border-t">
        <h2 className="text-3xl font-bold mb-4">Start Your Free NEET &amp; JEE OMR Practice Test</h2>
        <p className="text-muted-foreground mb-6">Create a free account, enter your first answer key, and check your practice responses.</p>
        <StartPracticeLink>Start OMR Practice</StartPracticeLink>
      </section>
    </PublicLayout>
  );
}
