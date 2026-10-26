# Expand the CBT Exams section

## Scope and defaults
Expand the existing CBT section while preserving personal Create OMR, courses, materials and current accounts. Keep the current paper-and-ink design.

The unanswered account questions will use these defaults: store all requested registration fields; retain a real email for recovery; use roll number and password for CBT sign-in. Existing students complete a separate CBT registration rather than receiving duplicate app accounts. Approval is required to start CBT exams, but pending students can see their registration status.

This project currently shares its app and Lovable Cloud database. These changes will **not** create an independent website or database. Include separation and integration documentation; a truly independent deployment requires a separate project/environment before that portion can be implemented.

## 1. Registration, login and student management
- Required full name, class, stream, institute, session and batch; optional guardian, school, course, city and administrator-configured extra fields.
- Generate a unique year-based roll number on the server, such as `STL-2026-000001`; sequence generation must be safe under concurrent registrations.
- Show pending, approved, rejected and suspended registration states. Only administrators can change approval, roll numbers, batches and exam authorization.
- Provide roll-number/password sign-in without exposing the email associated with a roll number. Retain email recovery through the existing public reset-password flow; add administrator-assisted recovery without showing or storing plaintext passwords.
- Prevent multiple CBT registrations for the same account and repeated verified email. Do not deduplicate on name alone.
- Admin student search and class/institute/batch filters, registration review and exam assignments.

## 2. Student dashboard and notifications
- Show registration/profile details and roll number.
- Show assigned, upcoming, available, unfinished and submitted exams, published results and examination history, using real records.
- Add My Admit Cards and a notification center with read/unread states.
- Notify students in-app about approval, assignments, schedule changes, admit-card availability and released results; support targeted announcements.
- Email/push delivery remains unavailable until its delivery service is configured.

## 3. Exam builder and question bank
- Retain existing draft editing, preview, publishing, questions with images, sections, single/multiple-correct answers, explanations, attempts, scoring and release settings.
- Add exam code, reporting time and eligibility by students, class, stream, institute and batch.
- Display total questions and maximum marks calculated from saved questions and marking rules.
- Add reusable subject/topic question-bank entries and validated CSV import with four or five options, answer validation and row-specific errors before saving.
- Support scheduling, cancellation and audited administrative changes; prevent unsafe changes to papers once attempts exist.

## 4. Live exams and evaluation
- Preserve countdown, palette, answer selection, clear response, previous/next, save-and-next, review flags, autosave, resume and submission confirmation.
- Verify deadlines, schedules, approval, assignments and attempt limits on the server for every relevant entry point.
- Preserve synchronized responses across interruptions. Show unsaved/connectivity errors honestly rather than claiming offline answers reached the server.
- Score submissions once on the server. Keep answers and unpublished results private; display “Submission Received — Result Pending” until release.

## 5. Digital admit cards
- Generate versioned admit-card records for authorized students with unique references and no credentials.
- Include student details, exam code, schedule/reporting time, duration and instructions; include photo where enabled.
- Provide view, PDF download, print and share; administrators generate, preview, replace/regenerate and manage cards in bulk.
- Add optional QR verification exposing only minimal valid-card information, never private student data.

## 6. Reports, organization settings and audit logs
- Use real records for eligible/not-attempted/started/in-progress/submitted counts, score range/average/distribution, question and subject performance and individual reports.
- Export CSV/PDF reports and student result PDFs, respecting result-release/review settings.
- Add organization branding settings, announcements and an admin-only audit view for important changes.

## Technical approach
- Extend existing CBT pages and server functions; keep authentication behind a dedicated adapter and version the integration boundary.
- Add CBT-specific registration, batch, assignment, notification, question-bank, admit-card and organization settings records. Apply explicit grants, row-level policies and server-side role checks.
- Keep stable account IDs; do not grant roles from user-editable registration fields. Resolve roll login only in a protected server function with rate limiting and generic failure messages.
- Keep private document/image access time-limited and scoped to authorized students or administrators.
- Document environment/domain configuration and future subdomain/account-linking requirements. No single sign-on or second database is implied by this upgrade.

## Verification
- Add tests for roll generation/uniqueness, approval gating, eligibility, CSV validation, deadline/resume, attempts, scoring and publication rules.
- Run the relevant existing and new tests; check current website errors.
- Exercise registration → admin approval → assignment → admit card → attempt/resume → submission → result release with real test records and two authorized identities.
- Verify students cannot read other students' records, edit approval, access private answer keys or see withheld results. Clearly report any checks blocked by account permissions or external services.