import { jsPDF } from 'jspdf';

export const NEET_SHEET_QUESTIONS = 180;
const OPTIONS = ['1', '2', '3', '4'];

/** Builds a printable A4 180-question, 4-option OMR practice sheet. */
export function buildNeetOmrSheet(questions = NEET_SHEET_QUESTIONS): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210;
  const margin = 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('NEET OMR Practice Sheet — 180 Questions', W / 2, 14, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Independent practice sheet by Smart AI OMR Analysis. Not an official NTA document.', W / 2, 19, { align: 'center' });

  // Candidate fields
  doc.setFontSize(9);
  const fields = ['Name', 'Test name / No.', 'Date'];
  fields.forEach((f, i) => {
    const x = margin + i * 64;
    doc.text(`${f}:`, x, 27);
    doc.line(x + doc.getTextWidth(`${f}:`) + 1, 27.5, x + 60, 27.5);
  });
  doc.setFontSize(7.5);
  doc.text('Fill one circle completely per question with a dark pen. Check your answers at smartaiomranalyis.lovable.app', margin, 33);

  // Grid: 4 columns x 45 rows
  const cols = 4;
  const rows = Math.ceil(questions / cols);
  const top = 39;
  const colW = (W - margin * 2) / cols;
  const rowH = (297 - top - 10) / rows;
  const r = Math.min(1.9, rowH / 2 - 0.4);

  doc.setLineWidth(0.2);
  for (let c = 0; c < cols; c++) {
    const x0 = margin + c * colW;
    doc.rect(x0, top - 3, colW - 2, rows * rowH + 2);
    for (let row = 0; row < rows; row++) {
      const q = c * rows + row + 1;
      if (q > questions) break;
      const y = top + row * rowH + rowH / 2;
      doc.setFontSize(7);
      doc.text(String(q).padStart(3, ' '), x0 + 2, y + 1);
      OPTIONS.forEach((o, i) => {
        const cx = x0 + 14 + i * 9;
        doc.circle(cx, y, r);
        doc.setFontSize(5);
        doc.text(o, cx, y + 0.8, { align: 'center' });
      });
    }
  }
  return doc;
}

export function downloadNeetOmrSheet() {
  buildNeetOmrSheet().save('free-neet-omr-sheet-180-questions.pdf');
}
