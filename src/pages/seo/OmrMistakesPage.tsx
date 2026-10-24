import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';
import { SEO } from '@/components/SEO';
import { PublicLayout, Prose, StartPracticeLink } from '@/components/PublicLayout';

const checklist = [
  'The question number I am marking matches the question I just solved.',
  'I filled the option number I chose, not the one next to it.',
  'Each circle is filled completely and darkly.',
  'No question has more than one circle filled.',
  'Questions I meant to skip are blank, and I have not skipped any by accident.',
  'When I moved to a new column, I started at the right question number.',
  'My answer key is for the same test, number and set as my paper.',
  'The answer key I entered has no missing or extra questions.',
  'I know the marking scheme for this test before calculating my score.',
];

export default function OmrMistakesPage() {
  const [done, setDone] = useState<boolean[]>(() => checklist.map(() => false));
  const count = done.filter(Boolean).length;
  return (
    <PublicLayout>
      <SEO
        title="NEET OMR Sheet Mistakes: A Student's Practice Checklist"
        description="Avoid common NEET OMR sheet mistakes in practice tests: shifted rows, wrong options, double marking and answer-key errors. Use the free checklist before you submit."
        breadcrumbs={[{ name: 'NEET OMR Mistakes', path: '/neet-omr-mistakes' }]}
      />
      <Prose>
        <h1 className="text-3xl md:text-4xl font-bold">NEET OMR Sheet Mistakes: A Student’s Practice Checklist</h1>
        <p className="text-lg text-muted-foreground">
          Marking mistakes cost marks even when you solved the question correctly. Here are the ones that show up most
          in practice tests, how to avoid them, and a checklist to run before you submit.
        </p>

        <h2>Matching question numbers</h2>
        <p>
          The most expensive mistake is a shifted row: you skip question 37 on the paper but forget to skip it on the sheet,
          so every answer after it lands one row off. Say the question number to yourself as you mark, and glance at the row
          number every five questions.
        </p>

        <h2>Selecting the correct option</h2>
        <p>
          NEET options are numbered 1–4, while your notes may use A–D. Decide on one system and stick to it. Before filling,
          touch the circle with your pen tip and confirm the number printed next to it.
        </p>

        <h2>Omissions and double marking</h2>
        <ul>
          <li>Mark answers in small batches (for example after each page) instead of all at the end.</li>
          <li>If you leave a question to come back to, put a small mark on the <em>question paper</em>, not on the OMR sheet.</li>
          <li>Treat two filled circles on one question as a wrong answer when you check — that is the safe assumption.</li>
        </ul>

        <h2>Verifying the answer key</h2>
        <p>
          A practice score is only as good as its answer key. Confirm the test number and set, count that the key has the
          right number of answers, and watch for revised keys where questions were changed or dropped.
        </p>

        <h2>Reviewing an unexpected result</h2>
        <p>
          If a score is much lower or higher than you expected, check the inputs before blaming yourself: answer key set,
          a missing answer in the key, a shifted row in your responses, then the marking scheme. The step-by-step method is in
          the <Link to="/how-to-check-neet-omr-sheet">guide to checking a NEET OMR sheet</Link>.
        </p>

        <h2 id="checklist">Before-you-submit checklist</h2>
        <p className="text-sm text-muted-foreground">Tick each item. Nothing is saved — it resets when you leave the page.</p>
        <ul className="!list-none !pl-0 space-y-3 not-prose">
          {checklist.map((item, i) => (
            <li key={i} className="flex items-start gap-3 border rounded-md bg-card p-3">
              <Checkbox
                id={`check-${i}`}
                checked={done[i]}
                onCheckedChange={(v) => setDone((d) => d.map((x, j) => (j === i ? v === true : x)))}
                className="mt-0.5"
              />
              <label htmlFor={`check-${i}`} className="cursor-pointer">{item}</label>
            </li>
          ))}
        </ul>
        <p className="font-medium" aria-live="polite">{count} of {checklist.length} checked</p>

        <h2>Practise and check</h2>
        <p>
          Print the <Link to="/free-neet-omr-sheet-pdf">free NEET OMR practice sheet PDF</Link>, take a timed mock test,
          then enter your responses and the answer key in Smart AI OMR Analysis to see your score.
        </p>
        <div className="pt-2"><StartPracticeLink /></div>
      </Prose>
    </PublicLayout>
  );
}
