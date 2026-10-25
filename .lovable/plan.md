# CBT Exams — admin-managed online exam system

A new, separate CBT Exams section. The personal "Create OMR" flow, saved exams, analytics and history stay as they are.

## What students get
- A **CBT Exams** card on Home and a link in the header/bottom navigation.
- Exam list with tabs: Upcoming, Available Now, In Progress, Submitted, Results Released, Expired. Cards show the real title, subject, date/time, duration and status. Buttons appear only when allowed (Details, Instructions, Start, Resume, View Submission, View Result).
- Instructions screen, then the exam screen: timer, question X of Y, options (single or multiple answer), question palette with 6 colour-coded states, answered/unanswered/marked counts, save status ("Saving…", "Saved", "Not saved — retrying").
- Controls: Previous, Next, Save & Next, Clear Response, Mark for Review, Review & Submit. Optional "no going back" mode set by the admin.
- Answers save automatically. Closing the app and reopening resumes the same attempt with the correct remaining time, which is based on the server's clock. Warnings at 5 and 1 minute left, then automatic submit when time runs out.
- Confirmation screen before submitting (totals and time left). After submitting: "Submission Received — Result Pending" until the result is released, then a full result and review with explanations if the admin allows them.

## What admins get (inside the existing protected Admin page, new "CBT Exams" tab)
- Dashboard: published, upcoming, active and completed exam counts, registered students and recent activity. All numbers come from real records.
- Create/edit a draft: title, description, subject, instructions, duration, start/end window, allowed attempts, marks for correct/wrong/unanswered answers, whether students can go back to earlier questions, when results are released (immediately, at a set time, or by hand), whether answers and explanations are shown, and which classes can take it (the student's profile class).
- Question builder: text, optional image, 4 or 5 options, single or multiple correct answers, marks and negative marks per question, explanation, sections, and reordering. Preview the paper and check the answer key.
- Publish (blocked if questions are missing or invalid), unpublish (only if nobody has started), cancel, release results.
- Reports per exam: eligible/started/submitted/in-progress/not-started counts, each student's result, average/highest/lowest score, score spread chart, and question-wise correct/wrong/unanswered. CSV export.

## Scoring rules
- Single correct: +correct marks if right, −negative marks if wrong, unanswered marks if blank.
- Multiple correct: full marks only for an exact match; any wrong option gives negative marks; a partial selection with no wrong options gets 0 (strict policy, shown to students in the instructions).
- Percentage = final score / maximum marks; accuracy = correct / attempted.

## Security
- Admin access comes only from the existing role list on the server. There is no admin sign-up and no client-side switch.
- Correct answers sit in a separate private table that students can never read. Scoring runs on the server.
- The server checks the exam window, class eligibility and attempt limits. Answers can only be saved before the deadline (with a small grace period). Submitting twice gives back the same result. Guests are blocked, as with other paid/social features.

## Design
- This keeps the current exam-desk look (paper background, ink text, orange accent, flat cards) and the logo. The brief's navy/cyan/purple palette is **not** used, because the saved design rules ban purple and glow effects. Say so if you want that changed.
- "Powered by SAINI TECHLABS · Analyze. Evaluate. Improve." goes in the CBT section footer.

## Limits to know
- Phone screen restrictions can't stop all cheating. This build doesn't detect switching to other apps or tabs.
- "Batches" use the student's class field. There is no separate batch system yet.

## Technical details
- New tables: `cbt_exams`, `cbt_sections`, `cbt_questions` (options as jsonb, no answers), `cbt_answer_keys` (admin-only), `cbt_attempts` (started_at, deadline, status, unique attempt_no), `cbt_responses` (attempt_id, question_id unique), `cbt_results` (one row per attempt), `cbt_audit_events`. Every table gets GRANTs and RLS. Admin access is checked with `is_admin()`. Guests are blocked with the restrictive policy pattern.
- SECURITY DEFINER RPCs: `cbt_list_exams()` (status computed with `now()`), `cbt_start_attempt(exam)` (checks the window, eligibility and attempt limit, returns the existing in-progress attempt if there is one), `cbt_get_paper(attempt)` (questions without keys), `cbt_save_response(attempt, q, selected, marked)` (deadline check, upsert), `cbt_submit(attempt)` (`SELECT … FOR UPDATE`, idempotent, scores and writes the result in one transaction), `cbt_get_result(attempt)` (only after release; keys/explanations per visibility setting), `cbt_server_time()`, `cbt_publish(exam)` (validation), `cbt_admin_report(exam)`. Expired attempts are finalized lazily on the next list, start or result call.
- Client: a timer from the server deadline plus a server-time offset; a save queue with retry, also kept in localStorage; question images in a new private `cbt-images` bucket (admin upload, signed URLs).
- Pages: `/cbt`, `/cbt/:examId`, `/cbt/attempt/:attemptId`, `/cbt/result/:attemptId`, and the admin tab in `AdminPage`.
- Tests (Vitest): pure scoring function (single/multi/negative/blank), remaining-time and deadline maths, status categorisation. Plus SQL checks run against the database: a student can't read keys or another student's attempt, starts outside the window are rejected, the attempt limit holds, and a second submit is idempotent.
- End-to-end check with Playwright as admin then student: create, publish, attempt, reload/resume, submit, pending, release, view result, CSV export, and confirm Create OMR still works.
