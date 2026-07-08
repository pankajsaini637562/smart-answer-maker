import { useEffect, useState } from 'react';
import { Share2, Copy, Check, Gift, Users, Sparkles, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AppHeader } from '@/components/AppHeader';
import { SEO } from '@/components/SEO';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { buildInviteLink } from '@/lib/referral';
import { REFERRAL_DISCOUNT_PERCENT, buildCouponCode } from '@/lib/paymentsConfig';
import { toast } from 'sonner';

interface Coupon { id: string; code: string; percent: number; }

export default function ReferPage() {
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [referrals, setReferrals] = useState(0);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [copied, setCopied] = useState(false);
  const [couponsOpen, setCouponsOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from('profiles').select('referral_code').eq('id', user.id).maybeSingle();
      setCode((data as any)?.referral_code || '');
      const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('referred_by', user.id);
      setReferrals(count || 0);
      const { data: credits } = await supabase.from('referral_credits')
        .select('id, percent').eq('user_id', user.id).is('used_purchase_id', null);
      const list: Coupon[] = (credits || []).map((c: any) => ({
        id: c.id,
        percent: c.percent,
        code: buildCouponCode('thanks', c.id, c.percent),
      }));
      setCoupons(list);
    })();
  }, [user]);

  const creditsPct = coupons.reduce((s, c) => s + c.percent, 0);
  const link = code ? buildInviteLink(code) : '';

  const copy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Invite link copied!');
    setTimeout(() => setCopied(false), 1500);
  };

  const copyCoupon = (c: Coupon) => {
    navigator.clipboard.writeText(c.code);
    toast.success(`Coupon ${c.code} copied — applies automatically at checkout.`);
  };

  const share = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: 'Smart AI OMR Analysis', text: `Get ${REFERRAL_DISCOUNT_PERCENT}% off your first study material!`, url: link }); } catch {}
    } else copy();
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Refer & Earn | Smart AI OMR Analysis" description="Invite friends and get discounts on study materials." noindex />
      <AppHeader />
      <main className="container py-6 space-y-5 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold font-display gradient-text">Refer & Earn</h1>
          <p className="text-sm text-muted-foreground">You both get {REFERRAL_DISCOUNT_PERCENT}% off — when your friend buys a paid course.</p>
        </div>

        <Card className="modern-card overflow-hidden">
          <div className="p-6 text-center space-y-3 bg-gradient-to-br from-primary/10 to-purple-500/10">
            <Gift className="w-10 h-10 mx-auto text-primary" />
            <h2 className="text-xl font-bold font-display">Your invite link</h2>
            <div className="flex items-center gap-2 max-w-md mx-auto">
              <Input readOnly value={link} className="rounded-xl h-11 text-sm" />
              <Button onClick={copy} variant="outline" size="icon" className="rounded-xl h-11 w-11 shrink-0">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Your code: <span className="font-mono font-bold text-primary">{code}</span></p>
            <Button onClick={share} className="rounded-xl h-11 gap-2 mt-2"><Share2 className="w-4 h-4" /> Share invite</Button>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card className="modern-card"><CardContent className="p-4 text-center">
            <Users className="w-5 h-5 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold font-mono">{referrals}</p>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Friends joined</p>
          </CardContent></Card>
          <button
            type="button"
            onClick={() => coupons.length > 0 && setCouponsOpen(true)}
            disabled={coupons.length === 0}
            className="text-left"
          >
            <Card className={`modern-card h-full transition ${coupons.length > 0 ? 'hover:border-primary/50 cursor-pointer' : 'opacity-80'}`}>
              <CardContent className="p-4 text-center">
                <Sparkles className="w-5 h-5 mx-auto text-primary mb-1" />
                <p className="text-2xl font-bold font-mono">{creditsPct}%</p>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Discount available</p>
                {coupons.length > 0 && (
                  <p className="text-[10px] text-primary mt-1 font-semibold">Tap to view coupon{coupons.length > 1 ? 's' : ''}</p>
                )}
              </CardContent>
            </Card>
          </button>
        </div>

        <Card className="modern-card"><CardContent className="p-4 space-y-2">
          <h3 className="font-semibold font-display">How it works</h3>
          <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
            <li>Share your invite link with friends.</li>
            <li>They sign up and get {REFERRAL_DISCOUNT_PERCENT}% off their first paid course.</li>
            <li>Once they buy, you earn a {REFERRAL_DISCOUNT_PERCENT}% discount credit — usable on your next paid course.</li>
          </ol>
        </CardContent></Card>
      </main>

      <Dialog open={couponsOpen} onOpenChange={setCouponsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Ticket className="w-5 h-5 text-primary" /> Your discount coupons
            </DialogTitle>
            <DialogDescription>
              These coupons apply automatically at checkout. One-time use per friend referred.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {coupons.map(c => (
              <div key={c.id} className="rounded-xl border border-primary/30 bg-primary/5 p-3 flex items-center justify-between gap-3">
                <div>
                  <p className="font-mono font-bold text-lg text-primary">{c.code}</p>
                  <p className="text-xs text-muted-foreground">{c.percent}% off next paid course</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => copyCoupon(c)} className="rounded-xl gap-1.5">
                  <Copy className="w-3.5 h-3.5" /> Copy
                </Button>
              </div>
            ))}
            <p className="text-[11px] text-muted-foreground text-center">
              You don't need to paste the code — the discount is applied automatically for your account.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
