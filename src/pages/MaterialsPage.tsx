import { useEffect, useState } from 'react';
import { Search, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppHeader } from '@/components/AppHeader';
import { SEO } from '@/components/SEO';
import { MaterialCard, MaterialCardData } from '@/components/MaterialCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function MaterialsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<MaterialCardData[]>([]);
  const [ownedIds, setOwnedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all' | 'free' | 'paid'>('all');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('materials')
        .select('id,title,description,subject,class,is_free,price_inr,cover_url')
        .eq('is_published', true).order('created_at', { ascending: false });
      setItems((data as any) || []);
      if (user) {
        const { data: p } = await supabase.from('purchases')
          .select('material_id').eq('user_id', user.id).in('status', ['approved', 'free']);
        setOwnedIds(new Set((p || []).map((x: any) => x.material_id)));
      }
      setLoading(false);
    })();
  }, [user]);

  const filtered = items.filter(m => {
    if (filter === 'free' && !m.is_free) return false;
    if (filter === 'paid' && m.is_free) return false;
    if (q && !m.title.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Study Materials | Smart AI OMR Analysis" description="Buy or download free study notes and exam material." />
      <AppHeader />
      <main className="container py-6 space-y-5 max-w-6xl">
        <div>
          <h1 className="text-2xl font-bold font-display gradient-text">Study Materials</h1>
          <p className="text-sm text-muted-foreground">Notes, PDFs and prep material. Free & premium.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search materials..." className="pl-9 rounded-xl h-11" />
          </div>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
            <TabsList className="h-11 rounded-xl">
              <TabsTrigger value="all" className="rounded-lg">All</TabsTrigger>
              <TabsTrigger value="free" className="rounded-lg">Free</TabsTrigger>
              <TabsTrigger value="paid" className="rounded-lg">Premium</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {loading ? (
          <div className="py-16 text-center text-muted-foreground">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
            No materials yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(m => <MaterialCard key={m.id} m={m} owned={ownedIds.has(m.id)} />)}
          </div>
        )}
      </main>
    </div>
  );
}
