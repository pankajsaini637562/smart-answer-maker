import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { PublicLayout, Prose, StartPracticeLink } from '@/components/PublicLayout';

export default function HowToCheckPage() {
  return (
    <PublicLayout>
      <SEO
        title="How to Check a NEET OMR Sheet and Calculate Your Practice Score"
        description="Step-by-step guide to checking a NEET practice OMR sheet: compare with the answer key, count correct, wrong and blank answers, and apply the marking scheme."
        breadcrumbs={[{ name: 'How to Check a NEET OMR Sheet', path: '/how-to-check-neet-omr-sheet' }]}
      />
      <Prose>
        <h1 className="text-3xl md:text-4xl font-bold">How to Check a NEET OMR Sheet and Calculate Your Practice Score</h1>
        <p className="text-lg text-muted-foreground">
          A practical method for checking your own mock-test OMR sheet, getting an accurate score, and catching the
          errors that make practice scores misleading.
        </p>
        <p className="text-sm text-muted-foreground border-l-4 border-primary pl-3">
          This is practice guidance, not official exam instruction. Marking schemes can differ between mock tests and can
          change between years. Always check the marking scheme in your test’s instructions or the current official NTA notice.
        </p>

        <h2>1. Get the right answer key</h2>
        <p>
          Make sure the answer key matches your exact paper — the same test series, test number and paper code or set.
          Many mock tests have several sets with the questions in a different order; a key for the wrong set produces a
          meaningless score.
        </p>

        <h2>2. Compare each response with the key</h2>
        <p>Go question by question and put each one into exactly one of three groups:</p>
        <ul>
          <li><strong>Correct</strong> — your marked option matches the key.</li>
          <li><strong>Incorrect</strong> — you marked an option that does not match the key. Treat more than one circle filled for a question as incorrect unless your test says otherwise.</li>
          <li><strong>Unanswered</strong> — no option is marked.</li>
        </ul>
        <p>Use a ruler under each row so your eyes don’t jump a line, and tick each question number on the key as you go.</p>

        <h2>3. Check that the counts add up</h2>
        <p>
          Correct + incorrect + unanswered must equal the number of questions you were supposed to attempt. If it
          doesn’t, you have skipped or double-counted a row — recount before calculating anything.
        </p>

        <h2>4. Apply the marking scheme</h2>
        <p>Write the scheme down before you start. For a scheme of +4 for correct, −1 for incorrect and 0 for unanswered:</p>
        <p className="font-mono bg-card border rounded p-3 text-sm">Score = (correct × 4) − (incorrect × 1)</p>
        <h3>Worked example</h3>
        <p>
          In a 180-question mock you get 130 correct, 32 incorrect and 18 unanswered. Check: 130 + 32 + 18 = 180 ✓.
          Score = 130 × 4 − 32 × 1 = 520 − 32 = <strong>488 out of 720</strong>.
        </p>
        <p>If your mock test uses a different scheme, replace the numbers with the ones in its instructions.</p>

        <h2>5. Double-check the result</h2>
        <ul>
          <li>Recalculate the score a second way, e.g. start from the maximum: 720 − (incorrect × 5) − (unanswered × 4) gives the same 488 in the example above.</li>
          <li>Spot-check five random questions against the key.</li>
          <li>If the score is far from what you expected, check the answer key set first, then look for a shifted row.</li>
        </ul>

        <h2>Common checking mistakes</h2>
        <ul>
          <li>Using the answer key for a different set or test number.</li>
          <li>Typing the answer key with one question missing, which shifts every answer after it.</li>
          <li>Counting a question twice when moving between columns.</li>
          <li>Forgetting negative marking, or applying it to unanswered questions.</li>
          <li>Ignoring questions that the test organiser later dropped or changed in a revised key.</li>
        </ul>
        <p>For marking-time mistakes, use the <Link to="/neet-omr-mistakes">NEET OMR mistakes checklist</Link>.</p>

        <h2>Doing it with Smart AI OMR Analysis</h2>
        <p>
          Instead of counting by hand, you can create an OMR test in the app with the number of questions and the marking
          scheme you need, enter the answer key, then fill in your responses. The app counts correct, incorrect and
          unanswered questions, calculates the score and keeps your attempts so you can see how your accuracy changes over time.
        </p>
        <p>No sheet yet? <Link to="/free-neet-omr-sheet-pdf">Download the free 180-question NEET OMR practice sheet</Link>.</p>
        <div className="pt-2"><StartPracticeLink /></div>
      </Prose>
    </PublicLayout>
  );
}
