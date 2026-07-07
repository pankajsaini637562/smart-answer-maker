import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, IndianRupee, Download, Lock, BookOpen, Loader2, Clock, CheckCircle2, XCircle, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { AppHeader } from '@/components/AppHeader';
import { SEO } from '@/components/SEO';
import { BuyModal } from '@/components/BuyModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { generateReceiptPdf } from '@/lib/receipt';

export default function MaterialDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [m, setM] = useState<any>(null);
  const [purchase, setPurchase] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [buyOpen, setBuyOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const load = async () => {
    if (!id) return;
    const { data } = await supabase.from('materials').select('*').eq('id', id).maybeSingle();
    setM(data);
    if (user && data) {
      const { data: p } = await supabase.from('purchases')
        .select('*').eq('user_id', user.id).eq('material_id', id).order('created_at', { ascending: false }).limit(1).maybeSingle();
      setPurchase(p);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [id, user]);

  const download = async () => {
    if (!id) return;
    setDownloading(true);
    const { data, error } = await supabase.functions.invoke('download-material', { body: { material_id: id } });
    setDownloading(false);
    if (error || !(data as any)?.url) { toast.error('Access denied'); return; }
    window.open((data as any).url, '_blank');
  };

  const downloadReceipt = () => {
    if (!purchase || !m || !user) return;
    generateReceiptPdf({
      receiptNo: purchase.receipt_no || 'PENDING',
      date: new Date(purchase.created_at).toLocaleString(),
      approvedAt: purchase.approved_at ? new Date(purchase.approved_at).toLocaleString() : '—',
      buyerName: (user.user_metadata as any)?.display_name || 'Student',
      buyerEmail: user.email || '',
      materialTitle: m.title,
      originalAmount: purchase.amount_inr,
      discountPercent: purchase.discount_percent,
      finalAmount: purchase.final_amount_inr,
      utr: purchase.utr || '—',
    });
  };

  if (loading) return (
    <div className="min-h-screen bg-background"><AppHeader /><div className="container py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div></div>
  );
  if (!m) return (
    <div className="min-h-screen bg-background"><AppHeader /><div className="container py-20 text-center text-muted-foreground">Not found.</div></div>
  );

  const owned = purchase && (purchase.status === 'approved' || purchase.status === 'free');
  const pending = purchase && purchase.status === 'pending';
  const rejected = purchase && purchase.status === 'rejected';

  return (
    <div className="min-h-screen bg-background">
      <SEO title={`${m.title} | Study Materials`} description={m.description?.slice(0, 155) || m.title} />
      <AppHeader />
      <main className="container py-6 space-y-5 max-w-3xl">
        <Link to="/materials"><Button variant="ghost" size="sm" className="gap-1"><ArrowLeft className="w-4 h-4" /> Back</Button></Link>

        <Card className="modern-card overflow-hidden">
          <div className="aspect-video bg-gradient-to-br from-primary/20 to-purple-500/10 flex items-center justify-center">
            {m.cover_url ? <img src={m.cover_url} alt={m.title} className="w-full h-full object-cover" /> : <BookOpen className="w-16 h-16 text-primary/60" />}
          </div>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h1 className="text-2xl font-bold font-display">{m.title}</h1>
                <div className="text-sm text-muted-foreground mt-1 flex gap-2">
                  {m.subject && <span>{m.subject}</span>}
                  {m.class && <span>• {m.class}</span>}
                </div>
              </div>
              {m.is_free
                ? <Badge className="bg-emerald-500 text-white border-0 text-base py-1 px-3">Free</Badge>
                : <Badge className="bg-primary text-white border-0 text-base py-1 px-3 flex items-center gap-0.5"><IndianRupee className="w-3.5 h-3.5" />{m.price_inr}</Badge>}
            </div>
            {m.description && <p className="text-sm text-muted-foreground whitespace-pre-line">{m.description}</p>}

            {!user ? (
              <Link to="/auth?next=/materials/${id}"><Button className="w-full h-11 rounded-xl">Sign in to access</Button></Link>
            ) : owned ? (
              <div className="space-y-2">
                <Button onClick={download} disabled={downloading} className="w-full h-11 rounded-xl gap-2">
                  {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Download material
                </Button>
                {!m.is_free && purchase?.receipt_no && (
                  <Button onClick={downloadReceipt} variant="outline" className="w-full h-11 rounded-xl gap-2">
                    <FileDown className="w-4 h-4" /> Download receipt
                  </Button>
                )}
              </div>
            ) : pending ? (
              <div className="rounded-xl border p-3 bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" /> Payment submitted. Waiting for admin approval.
              </div>
            ) : rejected ? (
              <div className="space-y-2">
                <div className="rounded-xl border p-3 bg-destructive/10 text-destructive flex items-center gap-2 text-sm">
                  <XCircle className="w-4 h-4" /> Payment rejected. {purchase.admin_note && <>Reason: {purchase.admin_note}</>}
                </div>
                <Button onClick={() => setBuyOpen(true)} className="w-full h-11 rounded-xl">Try again</Button>
              </div>
            ) : m.is_free ? (
              <Button onClick={download} disabled={downloading} className="w-full h-11 rounded-xl gap-2">
                {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Access for free
              </Button>
            ) : (
              <Button onClick={() => setBuyOpen(true)} className="w-full h-11 rounded-xl gap-2">
                <Lock className="w-4 h-4" /> Buy for ₹{m.price_inr}
              </Button>
            )}
          </CardContent>
        </Card>

        {m && <BuyModal material={m} open={buyOpen} onOpenChange={setBuyOpen} onSubmitted={load} />}
      </main>
    </div>
  );
}
