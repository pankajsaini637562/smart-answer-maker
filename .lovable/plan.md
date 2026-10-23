# App update based on the uploaded quality guide

## 1. Full redesign (new look)
- Replace the dark purple glow / frosted glass / 3D / pulsing style with a calm, clean "exam desk" look made for students:
  - Warm off-white paper background with a dark mode option, deep ink-blue text, one clear accent color (exam-sheet orange) for main buttons and correct answers, green and red only for right/wrong.
  - Simple flat cards with thin borders and soft shadows. No glow, no glass, no floating or pulsing buttons.
  - Headings keep a distinctive font, body text stays easy to read; same sizes and spacing used everywhere.
  - Motion only where it helps: small fades when a page opens, clear feedback when you press something.
- Applies to the home page, dashboard, exam, results, profile, courses, materials, leaderboard, and chat.

## 2. Home page claims
- "12,000+ students", "4.8/5 rating" and the testimonials stay as they are (your choice).

## 3. Accessibility
- Readable color contrast everywhere in the new colors.
- Names for icon-only buttons (close, menu, send, etc.) so screen readers can read them.
- Every form field has a label; clear keyboard focus outline.
- Buttons big enough to tap on phones; full-height screens fit mobile properly.

## 4. Error and loading messages
- Loading placeholders instead of blank screens on lists (courses, materials, leaderboard, library, chat).
- Friendly messages in plain words when something fails, with a "Try again" button.
- Empty pages explain what to do next (e.g. "No exams yet - start your first test").

## 5. Fewer small uppercase labels
- Remove the tiny all-caps labels above headings except where they really help.

## 6. Tests for prices, discounts and coupons
- Referral discount is 50% off.
- Coupon works one time per friend.
- Free materials and courses need no admin approval.
- Discounted price is calculated correctly (e.g. 10 rupees becomes 5).

## Technical details
- Redefine color, radius and shadow tokens in `src/index.css` and `tailwind.config.ts`; remove glass/glow utility classes and update components that use them.
- Update the design memory (replaces purple + glassmorphism rule).
- Add Vitest tests next to the referral/coupon/price logic.
