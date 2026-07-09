import { useEffect, useMemo, useState } from 'react';
import { Sparkles, Loader2, Target, Gauge, Lightbulb, TrendingUp, AlertTriangle, CheckCircle2, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { ExamResult, OMRSheet } from '@/types/exam';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

type Analysis = {
  overall_report?: string;
  strengths?: string[];
  weaknesses?: string[];
  pacing_note?: string;
  study_plan?: string[];
  per_question?: { n: number; difficulty: 'easy' | 'medium' | 'hard'; tip: string }[];
  topic_mastery?: { topic: string; mastery_pct: number; why: string }[];
  speed_zones?: {
    too_slow_wrong?: number[];
    too_fast_wrong?: number[];
    efficient_correct?: number[];
  };
};

const CACHE_PREFIX = 'exam_ai_v1_';

export function AiExamAnalysis({ result, sheet }: { result: ExamResult; sheet: OMRSheet }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = CACHE_PREFIX + result.attemptId;

  useEffect(() => {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try { setAnalysis(JSON.parse(cached)); } catch { /* ignore */ }
    }
  }, [cacheKey]);

  const scatterData = useMemo(
    () => result.questionResults.map((q) => ({
      x: q.timeSpent ?? 0,
      y: q.isCorrect ? 1 : q.userAnswer === null ? 0.5 : 0,
      z: 60,
      n: q.questionNumber,
      status: q.isCorrect ? 'Correct' : q.userAnswer === null ? 'Skipped' : 'Wrong',
    })),
    [result.questionResults],
  );

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const questions = result.questionResults.map((q) => ({
        n: q.questionNumber,
        correct: q.isCorrect,
        attempted: q.userAnswer !== null,
        time: q.timeSpent ?? 0,
      }));
      const { data, error } = await supabase.functions.invoke('exam-analysis', {
        body: {
          subject: sheet.subject || sheet.title,
          title: sheet.title,
          accuracy: result.accuracy,
          timeSpent: result.timeSpent,
          questions,
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const a: Analysis = (data as any)?.analysis || {};
      setAnalysis(a);
      localStorage.setItem(cacheKey, JSON.stringify(a));
      toast.success('AI analysis ready');
    } catch (e: any) {
      const msg = e?.message || 'Failed to generate AI analysis';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-8 space-y-6 print:hidden">
      <Card className="glass-card border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-display flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> Advanced AI Analysis
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Per-question breakdown, speed vs accuracy, topic mastery & study plan — powered by GPT‑5.5
            </p>
          </div>
          <div className="flex gap-2">
            {analysis && (
              <Button
                variant="outline"
                onClick={() => downloadPdf(result, sheet, analysis)}
                className="gap-2 rounded-xl"
              >
                <Download className="w-4 h-4" /> PDF
              </Button>
            )}
            <Button onClick={runAnalysis} disabled={loading} className="gap-2 rounded-xl">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {analysis ? 'Regenerate' : 'Analyze with AI'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Speed vs accuracy — always available from local timings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Gauge className="w-4 h-4" /> Speed vs Accuracy
          </CardTitle>
          <p className="text-xs text-muted-foreground">Each dot is one question. X = seconds spent, Y = outcome.</p>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis type="number" dataKey="x" name="Seconds" unit="s" />
              <YAxis
                type="number"
                dataKey="y"
                domain={[0, 1]}
                ticks={[0, 0.5, 1]}
                tickFormatter={(v) => (v === 1 ? 'Correct' : v === 0 ? 'Wrong' : 'Skipped')}
                width={70}
              />
              <ZAxis type="number" dataKey="z" range={[40, 120]} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                formatter={(_v, _n, p: any) => [`Q${p.payload.n} · ${p.payload.status}`, `${p.payload.x}s`]}
              />
              <Scatter data={scatterData} fill="hsl(var(--primary))" />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive/40">
          <CardContent className="pt-6 text-sm text-destructive flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> {error}
          </CardContent>
        </Card>
      )}

      {analysis && (
        <>
          {analysis.overall_report && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Overall Report
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm leading-relaxed">{analysis.overall_report}</p>
                {analysis.pacing_note && (
                  <p className="text-xs text-muted-foreground italic">⏱ {analysis.pacing_note}</p>
                )}
                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                  {!!analysis.strengths?.length && (
                    <div>
                      <p className="text-xs font-semibold uppercase text-emerald-600 mb-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
                      </p>
                      <ul className="text-sm space-y-1 list-disc pl-5">
                        {analysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  )}
                  {!!analysis.weaknesses?.length && (
                    <div>
                      <p className="text-xs font-semibold uppercase text-amber-600 mb-1 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Focus Areas
                      </p>
                      <ul className="text-sm space-y-1 list-disc pl-5">
                        {analysis.weaknesses.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {!!analysis.topic_mastery?.length && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-4 h-4" /> Topic Mastery
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysis.topic_mastery.map((t, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium">{t.topic}</span>
                      <span className="text-muted-foreground">{t.mastery_pct}%</span>
                    </div>
                    <Progress value={t.mastery_pct} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">{t.why}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {!!analysis.study_plan?.length && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" /> This Week's Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="text-sm space-y-2 list-decimal pl-5">
                  {analysis.study_plan.map((s, i) => <li key={i}>{s}</li>)}
                </ol>
              </CardContent>
            </Card>
          )}

          {!!analysis.per_question?.length && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Per-Question Breakdown</CardTitle>
                <p className="text-xs text-muted-foreground">Time, outcome, AI difficulty & 1-line tip.</p>
              </CardHeader>
              <CardContent>
                <div className="max-h-[420px] overflow-y-auto rounded-lg border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 sticky top-0">
                      <tr className="text-left">
                        <th className="p-2 w-10">Q</th>
                        <th className="p-2">Result</th>
                        <th className="p-2">Time</th>
                        <th className="p-2">Difficulty</th>
                        <th className="p-2">AI Tip</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.per_question.map((q) => {
                        const qr = result.questionResults.find((r) => r.questionNumber === q.n);
                        const status = !qr
                          ? '—'
                          : qr.isCorrect
                            ? 'Correct'
                            : qr.userAnswer === null ? 'Skipped' : 'Wrong';
                        const color =
                          status === 'Correct' ? 'bg-emerald-500/15 text-emerald-600'
                            : status === 'Wrong' ? 'bg-rose-500/15 text-rose-600'
                            : 'bg-muted text-muted-foreground';
                        return (
                          <tr key={q.n} className="border-t">
                            <td className="p-2 font-mono">{q.n}</td>
                            <td className="p-2"><span className={`px-2 py-0.5 rounded-full text-xs ${color}`}>{status}</span></td>
                            <td className="p-2">{qr?.timeSpent ?? 0}s</td>
                            <td className="p-2"><Badge variant="outline" className="capitalize">{q.difficulty}</Badge></td>
                            <td className="p-2 text-muted-foreground">{q.tip}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </section>
  );
}

function downloadPdf(result: ExamResult, sheet: OMRSheet, a: Analysis) {
  try {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 40;
    const maxW = pageW - margin * 2;
    let y = margin;

    const ensureSpace = (h: number) => {
      if (y + h > pageH - margin) {
        doc.addPage();
        y = margin;
      }
    };
    const writeLines = (text: string, size = 10, style: 'normal' | 'bold' | 'italic' = 'normal', gap = 4) => {
      doc.setFont('helvetica', style);
      doc.setFontSize(size);
      const lines = doc.splitTextToSize(text, maxW);
      for (const line of lines) {
        ensureSpace(size + gap);
        doc.text(line, margin, y);
        y += size + gap;
      }
    };
    const heading = (t: string) => { y += 6; writeLines(t, 13, 'bold', 6); };

    // Title
    writeLines('Advanced AI Analysis', 18, 'bold', 8);
    writeLines(`${sheet.title}${sheet.subject ? ` · ${sheet.subject}` : ''}`, 11, 'normal', 4);
    writeLines(
      `Accuracy: ${result.accuracy.toFixed(1)}%  ·  Score: ${result.score}/${result.totalMarks}  ·  Time: ${Math.round(result.timeSpent / 60)} min`,
      10, 'normal', 8,
    );
    doc.setDrawColor(200); doc.line(margin, y, pageW - margin, y); y += 10;

    if (a.overall_report) { heading('Overall Report'); writeLines(a.overall_report, 10); }
    if (a.pacing_note) { writeLines(`Pacing: ${a.pacing_note}`, 10, 'italic'); }
    if (a.strengths?.length) { heading('Strengths'); a.strengths.forEach(s => writeLines(`• ${s}`, 10)); }
    if (a.weaknesses?.length) { heading('Focus Areas'); a.weaknesses.forEach(s => writeLines(`• ${s}`, 10)); }

    if (a.topic_mastery?.length) {
      heading('Topic Mastery');
      a.topic_mastery.forEach(t => {
        writeLines(`${t.topic} — ${t.mastery_pct}%`, 10, 'bold', 2);
        writeLines(t.why, 9, 'normal', 4);
      });
    }
    if (a.study_plan?.length) {
      heading("This Week's Plan");
      a.study_plan.forEach((s, i) => writeLines(`${i + 1}. ${s}`, 10));
    }
    if (a.per_question?.length) {
      heading('Per-Question Breakdown');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
      ensureSpace(14);
      doc.text('Q', margin, y);
      doc.text('Result', margin + 30, y);
      doc.text('Time', margin + 90, y);
      doc.text('Diff.', margin + 130, y);
      doc.text('AI Tip', margin + 175, y);
      y += 12;
      doc.setFont('helvetica', 'normal');
      a.per_question.forEach(q => {
        const qr = result.questionResults.find(r => r.questionNumber === q.n);
        const status = !qr ? '—' : qr.isCorrect ? 'Correct' : qr.userAnswer === null ? 'Skipped' : 'Wrong';
        const tipLines = doc.splitTextToSize(q.tip || '', maxW - 175);
        const rowH = Math.max(12, tipLines.length * 11);
        ensureSpace(rowH);
        doc.setFontSize(9);
        doc.text(String(q.n), margin, y);
        doc.text(status, margin + 30, y);
        doc.text(`${qr?.timeSpent ?? 0}s`, margin + 90, y);
        doc.text(q.difficulty, margin + 130, y);
        doc.text(tipLines, margin + 175, y);
        y += rowH;
      });
    }

    const total = doc.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(140);
      doc.text(`Exam Master · Page ${i} of ${total}`, margin, pageH - 20);
      doc.setTextColor(0);
    }

    const safe = (sheet.title || 'analysis').replace(/[^a-z0-9]+/gi, '_').slice(0, 40);
    doc.save(`AI_Analysis_${safe}.pdf`);
    toast.success('PDF downloaded');
  } catch (e: any) {
    toast.error(e?.message || 'Failed to generate PDF');
  }
}
