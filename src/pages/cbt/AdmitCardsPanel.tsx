import { useCallback, useEffect, useState } from 'react';
import { Download, Eye, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { allCardsPdf, cardPdf, openPdf } from '@/lib/cbtPortal';
import { admitCardTheme } from '@/lib/admitCard';
import { toast } from 'sonner';

const rgb = (c: number[]) => `rgb(${c.join(',')})`;

/** Admin view of the current (non-revoked) admit cards for one exam. */
export function AdmitCardsPanel({ examId, published }: { examId: string; published: boolean }) {
  const [cards, setCards] = useState<any[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('cbt_admit_cards').select('*').eq('exam_id', examId).eq('revoked', false).order('created_at');
    if (error) { toast.error(error.message); setCards([]); return; }
    setCards((data ?? []).sort((a: any, b: any) => String(a.snapshot?.student?.roll_number ?? '').localeCompare(String(b.snapshot?.student?.roll_number ?? ''))));
  }, [examId]);
  useEffect(() => { load(); }, [load]);

  const run = async (key: string, fn: () => Promise<unknown>) => {
    setBusy(key);
    try { await fn(); } catch (e: any) { toast.error(e.message ?? 'Something went wrong'); } finally { setBusy(null); }
  };

  const regenerate = (users?: string[]) => run(users ? users[0] : 'all', async () => {
    const { data, error } = await (supabase.rpc as any)('cbt_generate_cards', { _exam: examId, _users: users ?? null });
    if (error) throw error;
    toast.success(`${data} admit card${data === 1 ? '' : 's'} issued`);
    await load();
  });

  if (!cards) return <div className="py-8 flex justify-center"><Loader2 className="w-5 h-5 animate-spin" /></div>;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{cards.length} current admit card{cards.length === 1 ? '' : 's'}. Each student's card has its own colour.</p>
        <div className="flex flex-wrap gap-2">
          {published && <Button variant="outline" size="sm" disabled={!!busy} onClick={() => regenerate()}>{busy === 'all' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}{cards.length ? 'Regenerate all' : 'Generate admit cards'}</Button>}
          {cards.length > 0 && <Button size="sm" disabled={!!busy} onClick={() => run('pdf', async () => (await allCardsPdf(cards)).save(`admit-cards-${examId.slice(0, 8)}.pdf`))}>{busy === 'pdf' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}Download all (one PDF)</Button>}
        </div>
      </div>
      {!published && <p className="text-sm rounded-md border bg-muted/50 p-3">Publish the exam to issue admit cards.</p>}
      {published && cards.length === 0 && <p className="text-sm rounded-md border bg-muted/50 p-3">No admit cards yet. If generating issues 0 cards, check the eligibility filters in Settings match your approved students.</p>}
      {cards.map(c => {
        const s = c.snapshot?.student ?? {};
        const t = admitCardTheme(s.roll_number ?? c.reference ?? '');
        return (
          <Card key={c.id}><CardContent className="p-3 flex flex-wrap items-center gap-3">
            <span className="w-3 self-stretch rounded-sm" style={{ background: rgb(t.main) }} aria-label={`${t.name} card`} title={`${t.name} card`} />
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{s.full_name ?? 'Student'}</p>
              <p className="text-xs text-muted-foreground font-mono">{s.roll_number} · {c.reference}</p>
            </div>
            <Badge variant="outline">v{c.version}</Badge>
            <div className="flex gap-1.5">
              <Button size="sm" variant="ghost" disabled={!!busy} onClick={() => run('v' + c.id, async () => openPdf(await cardPdf(c)))}><Eye className="w-4 h-4" />Preview</Button>
              <Button size="sm" variant="outline" disabled={!!busy} onClick={() => run('d' + c.id, async () => (await cardPdf(c)).save(`admit-card-${s.roll_number ?? c.reference}.pdf`))}><Download className="w-4 h-4" /></Button>
              {published && <Button size="sm" variant="ghost" disabled={!!busy} title="Replace with a new card (old one becomes invalid)" onClick={() => confirm('Replace this card? The old one will show as not valid.') && regenerate([c.user_id])}>{busy === c.user_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}</Button>}
            </div>
          </CardContent></Card>
        );
      })}
    </div>
  );
}
