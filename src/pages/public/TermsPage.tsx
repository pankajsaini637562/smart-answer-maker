import { PublicLayout } from "@/components/PublicLayout";

export default function TermsPage() {
  return (
    <PublicLayout>
      <article className="container mx-auto px-4 py-16 max-w-3xl prose-content">
        <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Legal</p>
        <h1 className="text-4xl font-bold font-display tracking-tight">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mt-2">Last updated: June 12, 2026</p>

        <p className="text-foreground/90 leading-relaxed mt-6">
          These Terms govern your use of Exam Master. By creating an account or using the service
          you agree to be bound by them. Please read them carefully.
        </p>

        <h2 className="text-2xl font-display font-semibold mt-10 mb-3">Eligibility</h2>
        <p className="text-foreground/90 leading-relaxed">
          You must be at least 13 years old to use Exam Master. Students under 18 should have a
          parent or guardian review these Terms.
        </p>

        <h2 className="text-2xl font-display font-semibold mt-10 mb-3">Acceptable use</h2>
        <ul className="space-y-2 my-4 list-disc list-outside pl-5 text-foreground/90 leading-relaxed">
          <li>Do not attempt to bypass authentication, row-level security, or any other access controls.</li>
          <li>Do not upload illegal, infringing, or harmful content to study groups.</li>
          <li>Do not use the service to harass other students.</li>
          <li>Do not scrape, automate, or load-test the service without prior written permission.</li>
        </ul>
        <p className="text-foreground/90 leading-relaxed">
          We may suspend or terminate accounts that violate these rules.
        </p>

        <h2 className="text-2xl font-display font-semibold mt-10 mb-3">Your content</h2>
        <p className="text-foreground/90 leading-relaxed">
          You retain ownership of everything you upload — your OMR sheets, notes, files, and study
          group messages. You grant us a limited licence to store, process, and display that
          content as required to operate the service.
        </p>

        <h2 className="text-2xl font-display font-semibold mt-10 mb-3">Our content</h2>
        <p className="text-foreground/90 leading-relaxed">
          The Exam Master interface, branding, blog articles, and underlying code are owned by us
          and protected by copyright. You may share links to our blog freely; please don't
          republish full articles without permission.
        </p>

        <h2 className="text-2xl font-display font-semibold mt-10 mb-3">Availability and changes</h2>
        <p className="text-foreground/90 leading-relaxed">
          We aim for high uptime but cannot guarantee uninterrupted service. We may change or
          discontinue features at any time, with reasonable notice for material changes.
        </p>

        <h2 className="text-2xl font-display font-semibold mt-10 mb-3">No warranty</h2>
        <p className="text-foreground/90 leading-relaxed">
          The service is provided "as is" without warranty of any kind. Exam Master is a study
          aid, not a guarantee of exam results. Your rank depends on your own preparation.
        </p>

        <h2 className="text-2xl font-display font-semibold mt-10 mb-3">Limitation of liability</h2>
        <p className="text-foreground/90 leading-relaxed">
          To the maximum extent permitted by law, Exam Master is not liable for indirect,
          incidental, or consequential damages arising from use of the service.
        </p>

        <h2 className="text-2xl font-display font-semibold mt-10 mb-3">Changes to these terms</h2>
        <p className="text-foreground/90 leading-relaxed">
          We may update these Terms from time to time. We will post the updated version with a new
          "last updated" date. Continued use after changes constitutes acceptance.
        </p>
      </article>
    </PublicLayout>
  );
}
