import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Sparkles, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { REFERRAL_DISCOUNT_PERCENT } from '@/lib/paymentsConfig';

const DISMISS_KEY = 'referral_promo_v1_dismissed';

export function ReferralPromoBanner() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    const t = setTimeout(() => setOpen(true), 900);
    return () => clearTimeout(t);
  }, [loading, user]);

  const dismiss = () => setOpen(false);


  const goRefer = () => {
    dismiss();
    navigate(user ? '/refer' : '/auth?next=/refer');
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) dismiss(); }}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-primary/30">
        <div className="relative bg-gradient-to-br from-primary/20 via-purple-500/15 to-pink-500/10 p-6 pb-5">
          <button
            onClick={dismiss}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/60 hover:bg-background flex items-center justify-center transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/20 text-primary px-2 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> New
            </span>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
            <Gift className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-2xl font-bold font-display leading-tight mb-2">
            Refer a friend, get <span className="gradient-text">{REFERRAL_DISCOUNT_PERCENT}% OFF</span>
          </h2>
          <p className="text-sm text-muted-foreground mb-5">
            Share your invite code. When your friend joins, you both unlock an auto-generated coupon for <b>{REFERRAL_DISCOUNT_PERCENT}% off</b> any paid study material. One-time use per friend.
          </p>

          <div className="space-y-2 mb-5 text-sm">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
              <span>Share your invite link or code</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
              <span>Friend enters the code at signup — instant confirmation</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
              <span>Coupon auto-applies at checkout — no code to paste</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={goRefer} className="flex-1 rounded-xl h-11 gap-2">
              <Gift className="w-4 h-4" /> {user ? 'Get my invite code' : 'Sign in & start'}
            </Button>
            <Button onClick={dismiss} variant="outline" className="rounded-xl h-11">
              Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
