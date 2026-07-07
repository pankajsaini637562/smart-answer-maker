import jsPDF from 'jspdf';

export interface ReceiptData {
  receiptNo: string;
  date: string;
  buyerName: string;
  buyerEmail: string;
  materialTitle: string;
  originalAmount: number;
  discountPercent: number;
  finalAmount: number;
  utr: string;
  approvedAt: string;
}

export function generateReceiptPdf(r: ReceiptData) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const w = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(124, 58, 237);
  doc.rect(0, 0, w, 80, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Smart AI OMR Analysis', 40, 40);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Payment Receipt', 40, 60);

  // Body
  doc.setTextColor(30, 30, 40);
  doc.setFontSize(11);
  let y = 120;
  const row = (k: string, v: string) => {
    doc.setFont('helvetica', 'bold'); doc.text(k, 40, y);
    doc.setFont('helvetica', 'normal'); doc.text(v, 220, y);
    y += 22;
  };
  row('Receipt No.', r.receiptNo);
  row('Date', r.date);
  row('Approved At', r.approvedAt);
  y += 6;
  doc.setDrawColor(220); doc.line(40, y, w - 40, y); y += 20;

  row('Buyer Name', r.buyerName || '—');
  row('Buyer Email', r.buyerEmail || '—');
  row('UPI UTR', r.utr || '—');
  y += 6;
  doc.line(40, y, w - 40, y); y += 20;

  row('Material', r.materialTitle);
  row('Original Amount', `INR ${r.originalAmount}`);
  if (r.discountPercent > 0) row('Discount', `${r.discountPercent}%`);

  y += 10;
  doc.setFillColor(245, 243, 255);
  doc.roundedRect(40, y - 4, w - 80, 40, 8, 8, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
  doc.setTextColor(88, 28, 209);
  doc.text('Total Paid', 60, y + 22);
  doc.text(`INR ${r.finalAmount}`, w - 60, y + 22, { align: 'right' });

  // Footer
  doc.setTextColor(140);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('This is a system-generated receipt. Thank you for your purchase!', 40, 780);

  doc.save(`Receipt-${r.receiptNo}.pdf`);
}
