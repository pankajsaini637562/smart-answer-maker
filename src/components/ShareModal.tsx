import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check, MessageCircle, Mail, Share2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ShareData {
  title: string;
  text: string;
  score: number;
  maxScore: number;
  accuracy: number;
}

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ShareData;
}

export function ShareModal({ open, onOpenChange, data }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const encodedText = encodeURIComponent(data.text);

  const channels = [
    {
      name: 'WhatsApp',
      icon: () => <MessageCircle className="w-5 h-5" />,
      color: 'bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20',
      url: `https://wa.me/?text=${encodedText}`,
    },
    {
      name: 'X / Twitter',
      icon: () => <span className="text-base font-bold">𝕏</span>,
      color: 'bg-foreground/5 text-foreground hover:bg-foreground/10',
      url: `https://twitter.com/intent/tweet?text=${encodedText}`,
    },
    {
      name: 'Telegram',
      icon: () => <Share2 className="w-5 h-5" />,
      color: 'bg-[#0088cc]/10 text-[#0088cc] hover:bg-[#0088cc]/20',
      url: `https://t.me/share/url?url=&text=${encodedText}`,
    },
    {
      name: 'Email',
      icon: () => <Mail className="w-5 h-5" />,
      color: 'bg-primary/10 text-primary hover:bg-primary/20',
      url: `mailto:?subject=${encodeURIComponent(data.title)}&body=${encodedText}`,
    },
  ];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(data.text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({ title: data.title, text: data.text });
    }
  };

  const percentage = Math.round((data.score / data.maxScore) * 100);
  const emoji = percentage >= 80 ? '🏆' : percentage >= 60 ? '🎯' : percentage >= 40 ? '📈' : '💪';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">Share Your Score</DialogTitle>
        </DialogHeader>

        {/* Score Preview Card */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent text-center space-y-1">
          <p className="text-4xl">{emoji}</p>
          <p className="text-2xl font-bold font-mono">{data.score}/{data.maxScore}</p>
          <p className="text-sm text-muted-foreground">{data.accuracy}% accuracy • {data.title}</p>
        </div>

        {/* Share Channels */}
        <div className="grid grid-cols-2 gap-2">
          {channels.map((ch) => (
            <a key={ch.name} href={ch.url} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" className={`w-full justify-start gap-3 rounded-xl h-12 ${ch.color}`}>
                {ch.icon()}
                {ch.name}
              </Button>
            </a>
          ))}
        </div>

        {/* Copy & Native Share */}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 rounded-xl gap-2" onClick={handleCopy}>
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Text'}
          </Button>
          {typeof navigator.share === 'function' && (
            <Button variant="outline" className="rounded-xl gap-2" onClick={handleNativeShare}>
              <Share2 className="w-4 h-4" /> More
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
