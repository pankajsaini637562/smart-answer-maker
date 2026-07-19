
## Overview
Add a full **Courses** section (Physics Wallah–style) as a separate dashboard, accessed from a featured hero card on Home. Uses Lovable's built-in payments (Stripe or Paddle — provider chosen at enable time) instead of the existing UPI+admin flow used by Materials. Adds an **instructor** role so approved teachers can publish courses.

## Home entry
- Add a large featured hero card on `Dashboard.tsx` ("Explore Courses — Learn like PW") linking to `/courses`.
- Add "Courses" to the top nav (`AppHeader.tsx`) and mobile nav.

## New routes
- `/courses` — catalog dashboard: category chips (Class 9–12, JEE, NEET, Boards, Skills), search, filters (subject, price, free/paid), course cards (cover, title, instructor, rating, price, "Enrolled" badge).
- `/courses/:id` — detail page: hero (cover, title, instructor, price, Enroll button), tabs — Overview / Curriculum (chapters → lessons) / Resources (PDFs) / Tests (linked OMR sheets) / Reviews.
- `/courses/:id/learn` — enrolled-only: sidebar chapter/lesson list, main pane shows lesson content (title, description, attached PDF, linked test button), "Mark complete" toggles progress.
- `/instructor` — instructor dashboard: create/edit courses, add chapters & lessons, upload PDFs, link OMR sheets as tests, publish/unpublish.

## Database (new tables, RLS + GRANTs per convention)
- `course_categories` (slug, name, icon) — public read.
- `courses` (title, slug, description, cover_url, category_id, instructor_id, price_inr, is_free, is_published, rating_avg, rating_count). Public read when `is_published`; instructor/admin write.
- `course_chapters` (course_id, title, position). Public read for published courses.
- `course_lessons` (chapter_id, title, description, resource_pdf_path, linked_sheet_id, position, is_preview). Non-preview lessons readable only to enrolled users or instructor/admin.
- `course_enrollments` (user_id, course_id, enrolled_at, source: 'paid'|'free'|'gift'). User can read own; insert only via server (edge function on payment webhook / free-enroll RPC).
- `course_lesson_progress` (user_id, lesson_id, completed_at). User manages own rows.
- `course_reviews` (user_id, course_id, rating 1–5, comment). Enrolled users insert/update own; public read.
- Extend `user_roles` with new enum value `instructor` (add via `ALTER TYPE app_role ADD VALUE 'instructor'`). Reuse existing `has_role()` helper.
- Storage bucket `course-content` (private) for lesson PDFs; `course-covers` (public) for cover images.

## Payments
- Enable Lovable's built-in payments — run `recommend_payment_provider` first, then enable Stripe (preferred for digital courses) or Paddle based on the recommendation.
- Product per course synced with `batch_create_product` (price = course price, tax code set).
- Checkout edge function creates a session; success webhook edge function inserts a `course_enrollments` row via service role.
- Free courses (`is_free=true`) skip checkout — an `enroll_free_course` RPC inserts the enrollment directly.
- Enrolled users see a persistent receipt on the course detail page (reuses existing `receipt.ts` PDF utility for a course receipt).

## Instructor role
- Users become instructor when an admin (existing `admin_emails` check) toggles them on a new "Instructors" tab of `/admin`.
- `/instructor` route is gated by `has_role(auth.uid(), 'instructor')` OR admin.
- Course/chapter/lesson RLS: instructor can write only rows where `courses.instructor_id = auth.uid()`; admin can write all.

## Profile updates
- Add a "My Courses" quick-link tile on `ProfilePage.tsx` linking to `/courses?tab=enrolled`.
- If instructor: add "Instructor Dashboard" quick-link.

## Files to create
- `src/pages/CoursesPage.tsx`, `CourseDetailPage.tsx`, `CourseLearnPage.tsx`, `InstructorPage.tsx`.
- `src/components/CourseCard.tsx`, `CourseHeroCard.tsx`, `CurriculumList.tsx`, `LessonPlayer.tsx`, `EnrollButton.tsx`.
- `src/hooks/useIsInstructor.ts`, `src/lib/courses.ts` (fetchers).
- `supabase/functions/create-course-checkout/index.ts`, `supabase/functions/course-payment-webhook/index.ts`.

## Files to modify
- `src/App.tsx` — add 4 routes.
- `src/components/AppHeader.tsx` — add Courses nav item (+ Instructor when applicable).
- `src/pages/Dashboard.tsx` — add featured Courses hero card.
- `src/pages/ProfilePage.tsx` — add My Courses / Instructor tiles.
- `src/pages/AdminPage.tsx` — add Instructors management tab.

## Build order
1. DB migration (tables, enum extension, RLS, GRANTs, storage buckets).
2. Run `recommend_payment_provider` → enable chosen provider → wait for confirmation.
3. Edge functions (checkout + webhook + free-enroll RPC).
4. Client routes/components in parallel.
5. Nav + profile updates.
6. Test enrollment flow end-to-end.
