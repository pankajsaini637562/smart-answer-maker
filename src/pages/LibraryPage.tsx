import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, BookOpen, FileDown, Clock, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AppHeader } from '@/components/AppHeader';
import { SEO } from '@/components/SEO';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { generateReceiptPdf } from '@/lib/receipt';

export default function LibraryPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from('purchases')
        .select('*, materials(*)')
        .eq('user_id', user.id).order('created_at', { ascending: false });
      setRows((data as any) || []);
      setLoading(false);
    })();
  }, [user]);

  const receipt = (p: any) => {
    generateReceiptPdf({
      receiptNo: p.receipt_no || 'PENDING',
      date: new Date(p.created_at).toLocaleString(),
      approvedAt: p.approved_at ? new Date(p.approved_at).toLocaleString() : '—',
      buyerName: (user?.user_metadata as any)?.display_name || 'Student',
      buyerEmail: user?.email || '',
      materialTitle: p.materials?.title || 'Material',
      originalAmount: p.amount_inr, discountPercent: p.discount_percent,
      finalAmount: p.final_amount_inr, utr: p.utr || '—',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="My Library | Smart AI OMR Analysis" description="Your purchased and free study materials." noindex />
      <AppHeader />
      <main className="container py-6 space-y-4 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold font-display gradient-text">My Library</h1>
          <p className="text-sm text-muted-foreground">Everything you've bought or accessed.</p>
        </div>

        {loading ? <div className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" /></div>
        : rows.length === 0 ? (
          <Card className="modern-card"><CardContent className="py-12 text-center text-muted-foreground">
            <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
            You haven't got any materials yet. <Link to="/materials" className="text-primary underline">Browse materials</Link>
          </CardContent></Card>
        ) : rows.map(p => (
          <Card key={p.id} className="modern-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/materials/${p.material_id}`} className="font-semibold hover:underline block truncate">{p.materials?.title}</Link>
                <div className="text-xs text-muted-foreground flex gap-2 items-center mt-0.5">
                  {p.status === 'approved' && <Badge className="bg-emerald-500/90 text-white border-0">Approved</Badge>}
                  {p.status === 'free' && <Badge className="bg-emerald-500/90 text-white border-0">Free</Badge>}
                  {p.status === 'pending' && <Badge className="bg-amber-500 text-white border-0 gap-1"><Clock className="w-3 h-3" /> Pending</Badge>}
                  {p.status === 'rejected' && <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" /> Rejected</Badge>}
                  <span>{new Date(p.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              {p.receipt_no && (
                <Button variant="outline" size="sm" onClick={() => receipt(p)} className="rounded-lg gap-1">
                  <FileDown className="w-3.5 h-3.5" /> Receipt
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </main>
    </div>
  );
}
