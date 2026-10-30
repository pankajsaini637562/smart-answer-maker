import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import logoAsset from '@/assets/logo.webp.asset.json';

type RGB = [number, number, number];
export interface AdmitTheme { name: string; dark: RGB; main: RGB; soft: RGB }

export const ADMIT_THEMES: AdmitTheme[] = [
  { name: 'blue', dark: [10, 35, 110], main: [30, 90, 220], soft: [232, 240, 255] },
  { name: 'teal', dark: [8, 70, 75], main: [15, 140, 140], soft: [228, 247, 246] },
  { name: 'green', dark: [20, 75, 35], main: [35, 140, 65], soft: [232, 247, 235] },
  { name: 'orange', dark: [120, 50, 5], main: [225, 110, 20], soft: [255, 241, 228] },
  { name: 'crimson', dark: [110, 15, 35], main: [200, 35, 65], soft: [253, 232, 236] },
  { name: 'purple', dark: [65, 25, 105], main: [125, 60, 190], soft: [243, 235, 252] },
  { name: 'indigo', dark: [35, 30, 100], main: [70, 70, 200], soft: [236, 236, 252] },
  { name: 'slate', dark: [30, 40, 55], main: [80, 100, 125], soft: [238, 241, 245] },
];

/** Same roll always yields the same theme. */
export function admitCardTheme(roll: string): AdmitTheme {
  let h = 0;
  for (const ch of roll ?? '') h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  // consecutive rolls differ in the last digit; weight it so neighbours differ
  const last = (roll ?? '').match(/(\d+)\s*$/);
  const idx = last ? (Number(last[1]) + (h % 7) * 0) % ADMIT_THEMES.length : h % ADMIT_THEMES.length;
  return ADMIT_THEMES[idx];
}

async function toPng(src: string): Promise<string | null> {
  try {
    const img = new Image(); img.crossOrigin = 'anonymous'; img.src = src; await img.decode();
    const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
    c.getContext('2d')!.drawImage(img, 0, 0); return c.toDataURL('image/png');
  } catch { return null; }
}

const fmtDate = (d?: string | null) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not specified';
const fmtTime = (d?: string | null) => d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Not specified';

export async function cardPdf(card: any): Promise<jsPDF> {
  const s = card.snapshot?.student ?? {}; const e = card.snapshot?.exam ?? {};
  const org = card.snapshot?.organization?.name ?? 'SAINI TECHLABS';
  const t = admitCardTheme(s.roll_number ?? card.reference ?? '');
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const W = 297, H = 210;
  const verifyUrl = `${window.location.origin}/cbt/verify/${card.reference}`;
  const [logo, qr, photo] = await Promise.all([
    toPng((logoAsset as any).url),
    QRCode.toDataURL(verifyUrl, { margin: 1, width: 300 }),
    s.photo_url ? toPng(s.photo_url) : Promise.resolve(null),
  ]);

  // header
  doc.setFillColor(...t.dark); doc.rect(0, 0, W, 30, 'F');
  doc.setFillColor(...t.main); doc.rect(0, 28, W, 2, 'F');
  doc.setFillColor(255, 255, 255); doc.roundedRect(8, 4, 22, 22, 2, 2, 'F');
  if (logo) doc.addImage(logo, 'PNG', 9, 5, 20, 20);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.text(org.toUpperCase(), 34, 14);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.text('Technology • AI • Innovation', 34, 20);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(18); doc.text('SMART AI OMR', W / 2 + 10, 12, { align: 'center' });
  doc.setFontSize(11); doc.text('CBT EXAMINATION SYSTEM', W / 2 + 10, 19, { align: 'center' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.text('Examinations. Evaluation. Performance.', W / 2 + 10, 25, { align: 'center' });
  doc.setFontSize(9); doc.text(['Smarter Examinations', 'Brighter Futures'], W - 10, 13, { align: 'right' });

  // title pill
  doc.setFillColor(...t.main); doc.roundedRect(W / 2 - 55, 34, 110, 11, 5.5, 5.5, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(255, 255, 255);
  doc.text('CBT EXAMINATION ADMIT CARD', W / 2, 41.5, { align: 'center' });
  doc.setDrawColor(...t.main); doc.setLineWidth(0.4); doc.line(15, 39.5, W / 2 - 60, 39.5); doc.line(W / 2 + 60, 39.5, W - 15, 39.5);

  const panel = (x: number, y: number, w: number, h: number, title: string) => {
    doc.setFillColor(255, 255, 255); doc.setDrawColor(...t.main); doc.setLineWidth(0.3); doc.roundedRect(x, y, w, h, 2, 2, 'FD');
    doc.setFillColor(...t.main); doc.roundedRect(x, y, Math.min(w, 70), 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.text(title, x + 4, y + 5.5);
  };
  const row = (x: number, y: number, label: string, value: string, lw = 38, vw = 60) => {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(60, 60, 70); doc.text(label, x, y);
    doc.text(':', x + lw, y); doc.setFont('helvetica', 'bold'); doc.setTextColor(20, 20, 30);
    doc.text(doc.splitTextToSize(String(value || '—'), vw)[0], x + lw + 3, y);
  };

  // student panel
  panel(10, 49, 150, 66, 'STUDENT DETAILS');
  doc.setFillColor(...t.soft); doc.setDrawColor(...t.main); doc.rect(14, 60, 30, 36, 'FD');
  if (photo) doc.addImage(photo, 'PNG', 14.5, 60.5, 29, 35);
  else { doc.setTextColor(120, 120, 130); doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.text('PHOTO', 29, 79, { align: 'center' }); }
  doc.setFontSize(6.5); doc.setTextColor(90, 90, 100); doc.text('STUDENT PHOTOGRAPH', 29, 101, { align: 'center' });
  row(50, 63, 'Student Name', s.full_name, 36, 68);
  doc.setFillColor(...t.dark); doc.roundedRect(48, 66, 108, 9, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.text('Roll Number', 50, 72); doc.text(':', 86, 72);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.text(String(s.roll_number ?? '—'), 89, 72.3);
  const sr: [string, string][] = [['Class', s.class], ['Stream', s.stream], ['Coaching Institute', s.institute], ['Batch / Section', s.batch], ['Academic Session', s.academic_session]];
  sr.forEach(([l, v], i) => row(50, 82 + i * 6.5, l, v, 36, 68));

  // exam panel
  panel(165, 49, 122, 66, 'EXAMINATION DETAILS');
  const er: [string, string][] = [
    ['Examination Name', e.title], ['Examination Code', e.code ?? 'Not set'], ['Subject / Group', e.subject ?? 'General'],
    ['Examination Date', fmtDate(e.starts_at)], ['Reporting Time', fmtTime(e.reporting_at)], ['Start Time', fmtTime(e.starts_at)],
    ['Duration', `${e.duration_minutes ?? '—'} minutes`], ['Examination Mode', 'Online (CBT)'], ['Venue / Instructions', e.venue ?? 'Online, via Smart AI OMR'],
  ];
  er.forEach(([l, v], i) => row(169, 63 + i * 5.7, l, v, 33, 78));

  // verification
  panel(10, 119, 150, 36, 'VERIFICATION & REFERENCE');
  doc.addImage(qr, 'PNG', 14, 129, 23, 23);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(60, 60, 70); doc.text(['Scan QR to verify', 'your admit card'], 40, 138);
  doc.setDrawColor(200, 200, 210); doc.line(66, 128, 66, 152);
  row(70, 133, 'Reference No.', card.reference, 26, 55);
  row(70, 140, 'Issue Date', fmtDate(card.issued_at ?? card.created_at), 26, 55);
  row(70, 147, 'Version', String(card.version ?? 1), 26, 55);
  doc.setFillColor(30, 150, 70); doc.roundedRect(130, 143, 22, 6, 3, 3, 'F');
  doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.text('VALID', 141, 147.2, { align: 'center' });

  // instructions
  panel(10, 159, 277, 36, 'IMPORTANT INSTRUCTIONS');
  const custom = String(e.instructions ?? '').split(/\n+/).map(x => x.trim()).filter(Boolean);
  const inst = (custom.length ? custom : [
    'Download or print your admit card before the examination.', 'Verify your personal and examination details.',
    'Follow the examination instructions provided by the administrator.', 'Arrive or log in at the configured reporting time.',
    'Contact the examination administrator for corrections or assistance.',
  ]).slice(0, 5);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(40, 40, 50);
  inst.forEach((l, i) => doc.text(`${i + 1}. ${doc.splitTextToSize(l, 200)[0]}`, 14, 172 + i * 4.6));
  doc.setFont('helvetica', 'bolditalic'); doc.setFontSize(12); doc.setTextColor(...t.dark);
  doc.text(['Your Effort', 'Builds Your', 'Future'], 250, 172, { align: 'center' });

  // footer
  doc.setFillColor(...t.dark); doc.rect(0, 199, W, 11, 'F');
  doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5);
  doc.text('SMART AI OMR – CBT EXAMINATION SYSTEM', 10, 204);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.text(`Powered by ${org}`, 10, 208);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.text('Analyze. Evaluate. Improve.', W - 10, 206, { align: 'right' });
  return doc;
}
