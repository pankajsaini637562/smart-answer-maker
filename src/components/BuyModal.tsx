import { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Loader2, IndianRupee, Copy, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { UPI_ID, buildUpiLink, REFERRAL_DISCOUNT_PERCENT, MAX_STACKED_DISCOUNT } from '@/lib/paymentsConfig';
import { toast } from 'sonner';

interface Material {
  id: string;
  title: string;
  price_inr: number;
}

export function BuyModal({ material, open, onOpenChange, onSubmitted }: {
  material: Material;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmitted: () => void;
}) {
  const { user } = useAuth();
  const [utr, setUtr] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const [discountPercent, setDiscountPercent] = useState(0);
  const [referrerId, setReferrerId] = useState<string | null>(null);
  const [creditsCount, setCreditsCount] = useState(0);

  useEffect(() => {
    if (!open || !user) return;
    (async () => {
      // Check referred user first-purchase discount
      const { data: prof } = await supabase.from('profiles').select('referred_by').eq('id', user.id).maybeSingle();
      const { count: paidCount } = await supabase.from('purchases')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id).in('status', ['approved', 'pending']);

      let pct = 0;
      let ref: string | null = null;
      if ((prof as any)?.referred_by && !paidCount) {
        pct += REFERRAL_DISCOUNT_PERCENT;
        ref = (prof as any).referred_by;
      }

      // Unused referral credits earned by this user
      const { data: credits } = await supabase.from('referral_credits')
        .select('percent').eq('user_id', user.id).is('used_purchase_id', null);
      const creditPct = (credits || []).reduce((s: number, c: any) => s + c.percent, 0);
      setCreditsCount(credits?.length || 0);
      pct = Math.min(pct + creditPct, MAX_STACKED_DISCOUNT);

      setDiscountPercent(pct);
      setReferrerId(ref);
    })();
  }, [open, user]);

  const finalAmount = Math.max(1, Math.round(material.price_inr * (100 - discountPercent) / 100));
  const upiLink = buildUpiLink(finalAmount, `${material.title.slice(0, 20)} #${material.id.slice(0, 6)}`);

  const copyUpi = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const submit = async () => {
    if (!user) return;
    if (!utr.trim() || utr.trim().length < 6) {
      toast.error('Enter a valid UPI transaction ID (UTR)');
      return;
    }
    setSubmitting(true);
    let screenshot_path: string | null = null;
    if (file) {
      const path = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const { error: upErr } = await supabase.storage.from('payment-proofs').upload(path, file, {
        contentType: file.type,
      });
      if (upErr) { toast.error(upErr.message); setSubmitting(false); return; }
      screenshot_path = path;
    }

    const { error } = await supabase.from('purchases').insert({
      user_id: user.id,
      material_id: material.id,
      amount_inr: material.price_inr,
      discount_percent: discountPercent,
      final_amount_inr: finalAmount,
      utr: utr.trim(),
      screenshot_path,
      referrer_user_id: referrerId,
      status: 'pending',
    } as any);
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Payment submitted! You will get access after admin approval.');
    onSubmitted();
    onOpenChange(false);
    setUtr(''); setFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Pay via UPI</DialogTitle>
          <DialogDescription>{material.title}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl bg-primary/5 border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Price</span>
              <span className="flex items-center font-semibold"><IndianRupee className="w-3.5 h-3.5" />{material.price_inr}</span>
            </div>
            {discountPercent > 0 && (
              <div className="flex items-center justify-between text-emerald-600">
                <span className="text-sm">Discount</span>
                <Badge className="bg-emerald-500/90 border-0 text-white">-{discountPercent}%</Badge>
              </div>
            )}
            <div className="flex items-center justify-between text-base font-bold border-t pt-3">
              <span>Total to Pay</span>
              <span className="flex items-center text-primary text-lg"><IndianRupee className="w-4 h-4" />{finalAmount}</span>
            </div>
            {creditsCount > 0 && (
              <p className="text-[11px] text-muted-foreground">Using {creditsCount} referral credit{creditsCount > 1 ? 's' : ''}.</p>
            )}
          </div>

          <div className="flex flex-col items-center gap-2 py-2">
            <div className="bg-white p-2 rounded-lg">
              <QRCodeCanvas value={upiLink} size={140} />
            </div>
            <p className="text-xs text-muted-foreground">Scan with any UPI app</p>
            <div className="flex items-center gap-2 w-full">
              <Input readOnly value={UPI_ID} className="rounded-xl h-10 text-sm" />
              <Button variant="outline" size="icon" onClick={copyUpi} className="rounded-xl h-10 w-10 shrink-0">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <a href={upiLink} className="text-xs text-primary underline">Open in UPI app</a>
          </div>

          <div className="space-y-2">
            <Label>UPI Transaction ID (UTR) *</Label>
            <Input value={utr} onChange={e => setUtr(e.target.value)} placeholder="e.g. 452345678901" className="rounded-xl h-11" maxLength={30} />
          </div>
          <div className="space-y-2">
            <Label>Payment screenshot (optional)</Label>
            <Input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="rounded-xl" />
          </div>

          <Button onClick={submit} disabled={submitting} className="w-full rounded-xl h-11">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit for Approval'}
          </Button>
          <p className="text-[11px] text-muted-foreground text-center">
            You will get access & receipt once admin verifies your payment (usually within a few hours).
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
