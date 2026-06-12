import { PublicLayout } from "@/components/PublicLayout";
import { Target, Users, Shield, Heart } from "lucide-react";

export default function AboutPage() {
  return (
    <PublicLayout>
      <section className="container mx-auto px-4 py-16 max-w-3xl">
        <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">About us</p>
        <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight">
          Built by aspirants, for aspirants
        </h1>
        <p className="text-lg text-muted-foreground mt-5 leading-relaxed">
          Exam Master started as a side project to fix a problem we all faced during our own NEET
          and JEE preparation: there was no tool that respected our time. Most platforms either
          drowned us in features we did not need, or hid the one thing we did need — honest,
          topic-level analytics — behind a paywall. So we built our own.
        </p>

        <p className="text-foreground/90 leading-relaxed mt-6">
          Today, Exam Master is used by students across India and overseas preparing for OMR-based
          entrance and board exams. We are deliberately mobile-first because that is how most
          students actually study — on the bus, between coaching classes, in the half-hour before
          dinner. Every feature we ship has to earn its place on a small screen with a slow data
          connection.
        </p>

        <h2 className="text-2xl font-display font-semibold mt-12 mb-4">What we believe</h2>
        <div className="grid sm:grid-cols-2 gap-5 mt-6">
          {[
            { icon: Target, title: "Honest analytics", body: "Your dashboard should be the single most truthful mirror of your preparation. No vanity scores, no inflated percentiles." },
            { icon: Users, title: "No paywalls for the basics", body: "OMR practice, scoring, and topic analytics are free and will stay free. We will never gate the fundamentals." },
            { icon: Shield, title: "Privacy by default", body: "Your data belongs to you. We use row-level security on every table and never sell student data, ever." },
            { icon: Heart, title: "Built mobile-first", body: "Most students study on their phone. Every screen is designed for one-thumb operation on a 5-inch display." },
          ].map(v => (
            <div key={v.title} className="modern-card p-5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                <v.icon className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold">{v.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{v.body}</p>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-display font-semibold mt-12 mb-4">Who we serve</h2>
        <p className="text-foreground/90 leading-relaxed">
          Exam Master is built for any student preparing for a competitive paper that uses an OMR
          answer sheet — including NEET, JEE Main, JEE Advanced, CUET, CLAT, SSC, GATE, CAT, and
          state-level entrance and board exams. Whether you are in class 9 starting early, a
          dropper repeating a year, or a college student preparing for post-graduate entrances, the
          workflow is the same: practice, scan, analyse, adapt.
        </p>

        <h2 className="text-2xl font-display font-semibold mt-12 mb-4">How we make money</h2>
        <p className="text-foreground/90 leading-relaxed">
          Exam Master is supported by carefully placed, non-intrusive ads on a few public pages
          (like this one). We will never put ads inside the practice or scoring screens, never run
          pop-ups, and never sell access to your data. Optional premium add-ons may launch in the
          future for advanced AI features, but the core product will always be free.
        </p>
      </section>
    </PublicLayout>
  );
}
