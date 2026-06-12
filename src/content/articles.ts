export interface Article {
  slug: string;
  title: string;
  description: string;
  author: string;
  publishedAt: string;
  readingMinutes: number;
  tags: string[];
  /** Markdown-lite: paragraphs separated by blank lines, ## for headings, - for bullets */
  body: string;
}

export const articles: Article[] = [
  {
    slug: "omr-sheet-practice-guide",
    title: "How to Practice with OMR Sheets the Right Way",
    description:
      "A complete, step-by-step guide to OMR sheet practice — how to fill bubbles cleanly, manage time, avoid common mistakes, and turn every practice paper into a learning session.",
    author: "Exam Master Editorial",
    publishedAt: "2026-05-04",
    readingMinutes: 8,
    tags: ["OMR", "Practice", "Exam Technique"],
    body: `OMR (Optical Mark Recognition) sheets look simple, but the students who score consistently treat them as a discipline. The bubbles, the timer, the order in which you attempt questions, and the way you review at the end all compound into the final score. This guide walks you through the way serious test-takers approach OMR practice — and how you can build the same habits at home.

## Why OMR practice deserves its own routine

Most students treat the OMR sheet as an afterthought — they study the subject, then bubble the answers in at the end. But the actual exam is graded by a machine that does not forgive a half-filled bubble, a stray mark, or an answer written in the wrong row. Roughly 4–7% of preventable mark loss in competitive exams like NEET, JEE Main, CUET and CLAT comes from OMR mistakes that have nothing to do with subject knowledge. Practising the sheet itself, with the same kind of seriousness you give to physics or biology, closes that gap.

## The five rules of a clean OMR sheet

- **One bubble, one answer.** If you ever fill two and try to erase one, the scanner will read both and mark the question wrong. Be decisive.
- **Fill, don't tick.** Cover the entire circle with a single, dark, vertical stroke. Hollow ticks and small dots are the leading cause of "answered but unread" entries.
- **Use the recommended pen.** Most Indian competitive exams require a black or blue ball-point pen. Gel pens smudge; pencils get rejected.
- **Match the question number every five rows.** A row-skip in question 23 silently destroys the next 50 answers. Build the habit of cross-checking row alignment at Q5, Q10, Q15… It costs you two seconds and saves you a re-take.
- **Never bubble in the booklet.** Many students mark the booklet first and transfer at the end. If the timer beats you to the transfer, all that work is wasted. Transfer in batches of ten as you go.

## A time-budget that actually works

A typical 180-question, 180-minute paper does not give you one minute per question — you also need to read, decide, bubble, and review. Try this allocation instead:

- **0–10 min:** Skim the entire paper and circle "easy wins" in the booklet.
- **10–110 min:** First pass. Solve every question you are confident about and bubble immediately, ten at a time.
- **110–160 min:** Second pass. Return to the marked-for-review questions. Make educated guesses where the cost of being wrong is acceptable (account for negative marking).
- **160–175 min:** OMR audit. Check that every row matches its question number and every bubble is fully filled.
- **175–180 min:** Buffer. Do nothing new. Breathe.

## The three OMR mistakes that cost the most marks

1. **Bubbling the wrong column for matrix questions.** Match-the-column questions usually require a row of four bubbles per question. Misalignment here loses four marks at a time.
2. **Filling a guess on a heavily negative question.** With −1 for a wrong answer and +4 for a right one, you need a better-than-25% chance of being correct just to break even. Guess only when you can eliminate two options.
3. **Erasing.** Even a "clean" erase leaves a smudge that triggers the scanner. If you suspect a wrong answer, mark it for review on the booklet and decide once.

## How Exam Master helps you build the habit

Exam Master's practice mode generates OMR-shaped sheets in your subject, scores them instantly, and shows you the exact bubbles you mis-filled. Repeat the same paper after a week, and the app overlays your previous run so you can see whether your bubble-filling speed has actually improved. Over a month, the data turns OMR practice from a chore into a measurable skill.

Treat the sheet with the same respect you give the questions, and the marks come back to you.`,
  },
  {
    slug: "neet-preparation-strategy",
    title: "NEET Preparation Strategy: 12 Months, 4 Phases, Zero Burnout",
    description:
      "A realistic, week-by-week NEET preparation plan covering Physics, Chemistry, and Biology — including how to balance NCERT, coaching material, and mock tests without burning out.",
    author: "Exam Master Editorial",
    publishedAt: "2026-04-22",
    readingMinutes: 11,
    tags: ["NEET", "Strategy", "Biology", "Physics", "Chemistry"],
    body: `NEET rewards consistency more than intensity. A student who studies six focused hours a day for twelve months will almost always beat one who studies twelve hours a day for three. This guide gives you a four-phase, twelve-month structure that has worked for thousands of medical aspirants, with concrete weekly targets and the trade-offs to expect.

## Phase 1 — Foundation (Months 1–3)

The first three months are about building the spine: NCERT, end-to-end. Biology in particular is roughly 70% NCERT-line based, and Chemistry's inorganic section is over 80% NCERT. Resist the urge to dive into coaching modules until your NCERT base is solid.

- Read each NCERT chapter twice — once for understanding, once with a highlighter.
- After each chapter, write a one-page handwritten summary. You will use these summaries in Phase 4 for revision; they are non-negotiable.
- Solve only NCERT exercise questions in this phase, not external problem sets.
- Take one 45-question topic test every weekend to track recall.

A reasonable target is 35 chapters in 12 weeks — about three a week. If you fall behind, do not extend Phase 1; carry the gap into Phase 2 and revise lighter chapters during travel days.

## Phase 2 — Application (Months 4–6)

Now layer the problem-solving on top. This is where coaching modules and standard references come in:

- **Physics:** HC Verma volume 1 and 2 problems, plus DC Pandey for objective practice.
- **Chemistry:** OP Tandon for physical, MS Chouhan for organic, JD Lee or NCERT exemplar for inorganic.
- **Biology:** NCERT exemplar plus Trueman's for the gaps NCERT leaves vague (especially morphology).

Target three to four chapters a week across all subjects, with at least one chapter from each subject in rotation. End every week with a 90-minute, 90-question mixed test.

## Phase 3 — Integration (Months 7–9)

This is the make-or-break phase. The goal is to move from "I know the chapter" to "I can answer any question from this chapter in 70 seconds." Two changes happen here:

1. **Mock test cadence doubles.** One full 180-question, 180-minute mock per week, untimed solution review on the next day.
2. **Error logs become sacred.** Every mistake goes into a notebook with three columns: the question, the conceptual gap, and the rule that fixes it. Re-read this notebook every Sunday.

Expect your first few mocks to feel discouraging. The score you see in month seven is not your final score — it is your starting line. Most students gain 80–120 marks between their first and their twentieth full mock simply because the test is a skill in itself.

## Phase 4 — Compression (Months 10–12)

The final three months are pure revision and test-taking. New material is now a distraction, not an asset. Stick to the summaries you wrote in Phase 1, your error log, and one targeted PYQ (previous-year-questions) chapter every day.

- **Mock cadence:** two per week, alternating timed and analytical.
- **Sleep:** push to 7.5 hours minimum. Sleep-deprived recall is a documented top-three reason for marks lost in the final week.
- **Stop comparing scores with friends.** Their mock provider is different, their syllabus coverage is different, and the only score that matters is the one you write on the day.

## How Exam Master fits into this plan

Every weekly test in Phases 1–4 can be created in Exam Master as an OMR sheet. The platform tracks your accuracy per topic over time, highlights chapters where your accuracy is plateauing, and suggests revision targets for the coming week. By Phase 3, your dashboard becomes the single most honest mirror of your preparation — better than any rank predictor.

NEET is not won in the last month. It is won in the boring middle, when you keep showing up.`,
  },
  {
    slug: "negative-marking-strategy",
    title: "Negative Marking: When to Guess and When to Skip",
    description:
      "A clear, math-backed framework for handling negative marking in NEET, JEE, CUET, CLAT, and other competitive exams — with concrete examples of when guessing helps and when it destroys your rank.",
    author: "Exam Master Editorial",
    publishedAt: "2026-03-18",
    readingMinutes: 7,
    tags: ["Strategy", "Exam Technique", "Mock Tests"],
    body: `Negative marking is the single most misunderstood part of competitive exams. Some students refuse to guess at all and leave marks on the table; others guess blindly and bleed marks they had already earned. The right answer is mathematical, and it is the same across NEET, JEE Main, CUET, CLAT, and almost every other +4 / −1 or +1 / −0.25 paper.

## The break-even formula

For an exam that awards +M for a correct answer and −N for a wrong one, with K options per question, your expected value of a pure random guess is:

  Expected value = (1 / K) × M − ((K − 1) / K) × N

Plug in NEET (M = 4, N = 1, K = 4):

  EV = (1 / 4) × 4 − (3 / 4) × 1 = 1 − 0.75 = +0.25

A pure random guess on NEET is mildly positive. The catch: this assumes you have zero information about the question. The moment you can eliminate even one option, the math becomes dramatically better.

## The elimination ladder

- **Eliminate 0 options:** Skip on JEE (M = 4, N = 1, K = 4 — same EV as NEET, but JEE rewards confidence; skip), guess on NEET if you have time.
- **Eliminate 1 option (3 options left):** EV jumps to +0.67 on NEET, +0.67 on JEE. Always guess.
- **Eliminate 2 options (2 options left):** EV is +1.5. This is free marks. Always guess, even if you have to write the answer in five seconds.
- **Eliminate 3 options:** You already know the answer. Bubble it.

## Why students still get this wrong

Three reasons dominate:

1. **Loss aversion.** Losing one mark feels worse than gaining one. Behavioural economics calls this prospect theory; it is the single biggest leak in your score.
2. **Time-budget collapse.** Students who burn time on hard early questions reach the end with no time to bubble the easy guesses they could have made.
3. **The "lucky paper" myth.** Believing one wrong guess will sink you ignores the law of large numbers. Across 50 partial-information guesses, your variance is small.

## The 60-second decision rule

When you encounter a question and 60 seconds have passed without progress:

- Have you eliminated at least one option? **Yes** → guess, mark for review, move on. **No** → skip entirely.
- Are you "almost there"? Almost-there is a trap. The cost of two more minutes here is two questions you will not reach later.

## Calibrating your own confidence

Most students systematically overestimate their confidence. Run this experiment for a week: every time you guess a question, write down whether you are 25%, 50%, 75% or 95% confident. After grading, compare your stated confidence to your actual accuracy. If your "75% confident" guesses are right only 55% of the time, you are over-confident and need a higher elimination threshold before guessing.

Exam Master's mock test mode tracks exactly this — your guess accuracy by confidence band — so you can stop relying on gut feel and start relying on calibrated data.

## A simple rule to remember

If you can rule out one option, guess. If you cannot, skip. Run that rule for one full mock and watch your score move by 15–25 marks without learning a single new concept.`,
  },
  {
    slug: "mock-test-analytics",
    title: "Reading Your Mock Test Analytics Like a Coach",
    description:
      "What to look at after every mock test — the four metrics that actually move your rank and the vanity metrics that waste your week.",
    author: "Exam Master Editorial",
    publishedAt: "2026-02-09",
    readingMinutes: 6,
    tags: ["Analytics", "Mock Tests", "Strategy"],
    body: `A mock test is worth less than you think. The analysis afterwards is worth far more than you think. Most students spend three hours on the test and twenty minutes on the review — the ratio should be the other way round. Here is a framework for getting the maximum signal out of every mock you take.

## Stop looking at the total score

Total score is a lagging indicator. It tells you where you were on test day, not where you will be on exam day. Look instead at these four metrics:

1. **Accuracy per topic.** A 65% overall accuracy might hide a 95% accuracy in mechanics and a 30% accuracy in thermodynamics. Fixing thermodynamics is a 7-point opportunity; polishing mechanics is a 0.5-point opportunity.
2. **Time per correct answer.** If you got 30 mechanics questions right in 40 minutes, you are spending 1.33 minutes per correct mark. If you got 20 thermodynamics questions right in 35 minutes, you are spending 1.75 minutes per correct mark. The second topic is leaking time even when you are right.
3. **First-attempt vs. second-attempt accuracy.** Did you mark a question, return, and change your answer? If your "change" accuracy is below 40%, stop changing answers — your first instinct is better than your second guess.
4. **Question-difficulty mismatch.** Take the questions you got wrong and look at the all-India accuracy on each. If the top 1% got it right, the gap is conceptual. If only 20% of test-takers got it right, the gap is normal — don't over-study an outlier.

## The error log that changes ranks

After every mock, write a single line per wrong question in a notebook with three fields:

- **What I thought.** The mental shortcut or formula you used.
- **What was true.** The correct mental model.
- **The rule I now know.** A one-sentence rule that, if applied, would have caught the mistake.

Re-read this log every Sunday. By month three, the same five rules will appear over and over — that is your personal weakness map. Fix those five, and your rank moves.

## Vanity metrics to ignore

- **Percentile in low-tier mocks.** Percentile inflation in unofficial mocks is real. Use the same provider for at least eight tests before trusting the trend line.
- **Speed PRs.** Finishing the paper 20 minutes early is not a flex. It usually means you skipped questions you could have solved.
- **Comparison with toppers.** Looking at a topper's analytics is fun but actionable insight is in your own data, not theirs.

## What good progress looks like

A healthy mock-to-mock trajectory shows:

- Accuracy in your weakest two topics climbing 3–5% per month.
- Time per correct answer dropping 5–8 seconds per month.
- First-attempt accuracy rising while change rate falls.
- The same conceptual error not appearing twice in your error log.

If you are taking a mock every week and not seeing any of these four trends after eight weeks, the problem is your post-test ritual, not your study schedule.

## How Exam Master surfaces the right signal

The Analytics screen plots every one of these metrics over time and highlights topics that have plateaued for more than three tests. The Adaptive Insights panel will then suggest revision topics ranked by their potential mark gain — not by the topics you got most wrong, but by the topics where a small intervention produces the largest score change. That is what a coach does for an elite athlete, and that is what your dashboard should do for you.

The mock is the workout. The analytics are the coaching. Skip the second and you waste the first.`,
  },
];

export const getArticle = (slug: string) => articles.find(a => a.slug === slug);
