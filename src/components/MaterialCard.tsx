import { Link } from 'react-router-dom';
import { Lock, Download, IndianRupee, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface MaterialCardData {
  id: string;
  title: string;
  description?: string | null;
  subject?: string | null;
  class?: string | null;
  is_free: boolean;
  price_inr: number;
  cover_url?: string | null;
}

export function MaterialCard({ m, owned }: { m: MaterialCardData; owned?: boolean }) {
  return (
    <Link to={`/materials/${m.id}`} className="block group">
      <Card className="modern-card overflow-hidden h-full transition-transform group-hover:-translate-y-0.5">
        <div className="aspect-video relative bg-gradient-to-br from-primary/20 to-purple-500/10 flex items-center justify-center">
          {m.cover_url ? (
            <img src={m.cover_url} alt={m.title} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <BookOpen className="w-10 h-10 text-primary/70" />
          )}
          <div className="absolute top-2 right-2 flex gap-1">
            {m.is_free ? (
              <Badge className="bg-emerald-500/90 text-white border-0">Free</Badge>
            ) : (
              <Badge className="bg-primary text-primary-foreground border-0 flex items-center gap-0.5">
                <IndianRupee className="w-3 h-3" />{m.price_inr}
              </Badge>
            )}
            {owned && <Badge className="bg-white/90 text-primary border-0"><Download className="w-3 h-3" /></Badge>}
            {!m.is_free && !owned && <Badge variant="secondary" className="border-0"><Lock className="w-3 h-3" /></Badge>}
          </div>
        </div>
        <CardContent className="p-3 space-y-1.5">
          <h3 className="font-semibold font-display leading-tight line-clamp-2">{m.title}</h3>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            {m.subject && <span className="truncate">{m.subject}</span>}
            {m.subject && m.class && <span>•</span>}
            {m.class && <span>{m.class}</span>}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
