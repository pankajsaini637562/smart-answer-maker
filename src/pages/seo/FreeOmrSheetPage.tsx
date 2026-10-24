import { Link } from 'react-router-dom';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/SEO';
import { PublicLayout, Prose, StartPracticeLink } from '@/components/PublicLayout';
import { downloadNeetOmrSheet } from '@/lib/omrSheetPdf';
import { trackEvent } from '@/lib/site';

function SheetPreview() {
  return (
    <div aria-hidden="true" className="border rounded-lg bg-card p-4 font-mono text-xs">
      <div className="text-center font-semibold mb-3">NEET OMR Practice Sheet — 180 Questions</div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 46, 91, 136].map((start) => (
          <div key={start} className="border rounded p-2 space-y-1.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="w-7 text-right text-muted-foreground">{start + i}</span>
                {[1, 2, 3, 4].map((o) => (
                  <span key={o} className="w-4 h-4 rounded-full border border-foreground/60 text-[9px] flex items-center justify-center">{o}</span>
                ))}
              </div>
            ))}
            <div className="text-center text-muted-foreground">⋮</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FreeOmrSheetPage() {
  const onDownload = () => {
    downloadNeetOmrSheet();
    trackEvent('omr_sheet_pdf_download', { questions: 180 });
  };
  return (
    <PublicLayout>
      <SEO
        title="Free NEET OMR Sheet PDF — 180-Question Practice Sheet"
        description="Download a free, printable 180-question NEET OMR practice sheet PDF. Practise bubble marking, then check your answers online with an answer key."
        breadcrumbs={[{ name: 'Free NEET OMR Sheet PDF', path: '/free-neet-omr-sheet-pdf' }]}
      />
      <Prose>
        <h1 className="text-3xl md:text-4xl font-bold">Download a Free NEET OMR Practice Sheet PDF</h1>
        <p className="text-lg text-muted-foreground">
          A printable A4 answer sheet with 180 questions and four options (1–4) per question, laid out in four columns
          so it fits on one page. Use it with any NEET mock test or question paper to practise filling bubbles under time pressure.
        </p>
        <div className="flex flex-wrap gap-3 not-prose">
          <Button size="lg" onClick={onDownload} className="gap-2"><Download className="w-4 h-4" /> Download free PDF</Button>
          <StartPracticeLink variant="outline">Check answers online</StartPracticeLink>
        </div>
        <p className="text-sm text-muted-foreground border-l-4 border-primary pl-3">
          This sheet is created independently by Smart AI OMR Analysis for practice. It is not an official NTA document and its
          layout differs from the real NEET answer sheet. Always read the official instructions for your exam.
        </p>

        <h2>Preview</h2>
        <SheetPreview />
        <p className="text-sm text-muted-foreground">The PDF has fields for your name, test name and date, followed by questions 1–180.</p>

        <h2>How to print it</h2>
        <ul>
          <li>Print on A4 paper at <strong>100% / actual size</strong>. Turn off “fit to page” so the circles stay round.</li>
          <li>Black-and-white printing is fine. One sheet per mock test.</li>
          <li>On a phone, open the downloaded file and use your PDF viewer’s print or share option.</li>
        </ul>

        <h2>How to use it in a practice test</h2>
        <ol>
          <li>Keep the question paper and the sheet side by side, just like exam day.</li>
          <li>Set a timer for the length of your mock test.</li>
          <li>Fill one circle completely per question with a dark ball-point pen. Leave a question blank if you choose not to attempt it.</li>
          <li>When time is up, stop marking — this builds the habit of not transferring answers in the last seconds.</li>
        </ol>

        <h2>Check your marked answers</h2>
        <p>
          After the test, compare your marked answers with the answer key. You can do this by hand
          (see <Link to="/how-to-check-neet-omr-sheet">how to check a NEET OMR sheet</Link>) or enter your responses and the
          answer key in Smart AI OMR Analysis to count correct, incorrect and unanswered questions and calculate your score
          with the marking scheme you choose.
        </p>
        <p>
          Before you submit, run through the <Link to="/neet-omr-mistakes">NEET OMR mistakes checklist</Link> — most lost
          marks in practice come from skipped rows and wrongly entered answer keys, not from the questions themselves.
        </p>

        <h2>Why practise on a paper OMR sheet?</h2>
        <p>
          Marking answers on a separate sheet takes time and introduces its own mistakes: shifting a row, marking the wrong
          option number, or leaving a circle half-filled. Practising the full paper workflow lets you find out how long
          transferring answers takes you and where you tend to slip, before it matters.
        </p>
      </Prose>
    </PublicLayout>
  );
}
