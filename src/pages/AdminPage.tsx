import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Upload, Loader2, Plus, ClipboardList, CheckCircle2, XCircle, IndianRupee, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AppHeader } from '@/components/AppHeader';
import { SEO } from '@/components/SEO';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function AdminPage() {
  const { user } = useAuth();
  const { isAdmin, loading } = useIsAdmin();
  const [tab, setTab] = useState('upload');

  // Upload form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [cls, setCls] = useState('');
  const [isFree, setIsFree] = useState(false);
  const [price, setPrice] = useState<number>(99);
  const [file, setFile] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Purchases
  const [purchases, setPurchases] = useState<any[]>([]);
  const [pLoading, setPLoading] = useState(false);
  const [materials, setMaterials] = useState<any[]>([]);

  const loadPurchases = async () => {
    setPLoading(true);
    const { data } = await supabase.from('purchases')
      .select('*, materials(title,price_inr)')
      .order('created_at', { ascending: false }).limit(200);
    setPurchases((data as any) || []);
    setPLoading(false);
  };

  const loadMaterials = async () => {
    const { data } = await supabase.from('materials').select('*').order('created_at', { ascending: false });
    setMaterials((data as any) || []);
  };

  useEffect(() => { if (isAdmin) { loadPurchases(); loadMaterials(); } }, [isAdmin]);

  if (loading) return <div className="min-h-screen bg-background"><AppHeader /><div className="container py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div></div>;
  if (!user) return <Navigate to="/auth?next=/admin" replace />;
  if (!isAdmin) return (
    <div className="min-h-screen bg-background"><AppHeader />
      <main className="container py-16 max-w-md text-center space-y-3">
        <h1 className="text-2xl font-bold font-display">Admin only</h1>
        <p className="text-sm text-muted-foreground">Your email is not registered as an admin. Ask a project owner to add <span className="font-mono">{user.email}</span> to the admin list.</p>
        <Link to="/"><Button variant="outline" className="rounded-xl">Go home</Button></Link>
      </main>
    </div>
  );

  const upload = async () => {
    if (!title.trim() || !file) { toast.error('Title & file are required'); return; }
    setUploading(true);
    const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const { error: upErr } = await supabase.storage.from('study-materials').upload(path, file, { contentType: file.type });
    if (upErr) { toast.error(upErr.message); setUploading(false); return; }

    let cover_url: string | null = null;
    if (cover) {
      const cpath = `covers/${Date.now()}-${cover.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const { error: cErr } = await supabase.storage.from('avatars').upload(cpath, cover, { contentType: cover.type });
      if (!cErr) cover_url = supabase.storage.from('avatars').getPublicUrl(cpath).data.publicUrl;
    }

    const { error } = await supabase.from('materials').insert({
      title, description, subject, class: cls,
      is_free: isFree, price_inr: isFree ? 0 : price,
      file_path: path, cover_url, created_by: user.id,
    } as any);
    setUploading(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Material published!');
    setTitle(''); setDescription(''); setSubject(''); setCls(''); setPrice(99); setFile(null); setCover(null); setIsFree(false);
    loadMaterials();
  };

  const approve = async (p: any) => {
    const { error } = await supabase.from('purchases').update({
      status: 'approved', approved_by: user.id, approved_at: new Date().toISOString(),
    } as any).eq('id', p.id);
    if (error) return toast.error(error.message);
    toast.success('Approved & receipt issued.');
    loadPurchases();
  };
  const reject = async (p: any) => {
    const note = prompt('Reason for rejection?') || 'Payment could not be verified';
    const { error } = await supabase.from('purchases').update({
      status: 'rejected', admin_note: note, approved_by: user.id, approved_at: new Date().toISOString(),
    } as any).eq('id', p.id);
    if (error) return toast.error(error.message);
    toast.success('Rejected.');
    loadPurchases();
  };
  const viewProof = async (path: string) => {
    const { data } = await supabase.storage.from('payment-proofs').createSignedUrl(path, 300);
    if (data?.signedUrl) window.open(data.signedUrl, '_blank');
  };
  const removeMaterial = async (id: string) => {
    if (!confirm('Delete this material?')) return;
    const { error } = await supabase.from('materials').delete().eq('id', id);
    if (error) return toast.error(error.message);
    loadMaterials();
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Admin | Smart AI OMR Analysis" description="Admin panel" noindex />
      <AppHeader />
      <main className="container py-6 space-y-5 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold font-display gradient-text">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">Upload materials and approve payments.</p>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="rounded-xl h-11">
            <TabsTrigger value="upload" className="rounded-lg gap-1"><Plus className="w-4 h-4" /> Upload</TabsTrigger>
            <TabsTrigger value="payments" className="rounded-lg gap-1"><ClipboardList className="w-4 h-4" /> Payments</TabsTrigger>
            <TabsTrigger value="materials" className="rounded-lg">Materials</TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <Card className="modern-card">
              <CardHeader><CardTitle className="text-lg font-display">Upload study material</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label>Title *</Label><Input value={title} onChange={e => setTitle(e.target.value)} className="rounded-xl h-11" /></div>
                <div className="space-y-2"><Label>Description</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} className="rounded-xl" rows={3} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Subject</Label><Input value={subject} onChange={e => setSubject(e.target.value)} className="rounded-xl h-11" placeholder="e.g. Physics" /></div>
                  <div className="space-y-2"><Label>Class</Label><Input value={cls} onChange={e => setCls(e.target.value)} className="rounded-xl h-11" placeholder="e.g. 12th" /></div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border p-3">
                  <Switch checked={isFree} onCheckedChange={setIsFree} />
                  <Label>Free course (no payment / approval needed)</Label>
                </div>
                {!isFree && <div className="space-y-2"><Label>Price (INR) *</Label>
                  <Input type="number" min={1} value={price} onChange={e => setPrice(parseInt(e.target.value) || 0)} className="rounded-xl h-11" />
                </div>}
                <div className="space-y-2"><Label>File (PDF / Zip / etc) *</Label><Input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="rounded-xl" /></div>
                <div className="space-y-2"><Label>Cover image (optional)</Label><Input type="file" accept="image/*" onChange={e => setCover(e.target.files?.[0] || null)} className="rounded-xl" /></div>
                <Button onClick={upload} disabled={uploading} className="w-full h-11 rounded-xl gap-2">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Publish
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-3">
            {pLoading ? <div className="py-10 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" /></div>
            : purchases.length === 0 ? <p className="text-center text-muted-foreground py-10">No purchases yet.</p>
            : purchases.map(p => (
              <Card key={p.id} className="modern-card"><CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="font-semibold">{p.materials?.title}</p>
                    <p className="text-xs text-muted-foreground">User: {p.user_id.slice(0, 8)}… • UTR: <span className="font-mono">{p.utr || '—'}</span></p>
                    <p className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center font-bold text-primary"><IndianRupee className="w-3.5 h-3.5" />{p.final_amount_inr}</div>
                    {p.discount_percent > 0 && <p className="text-[10px] text-muted-foreground">-{p.discount_percent}% off</p>}
                    {p.status === 'pending' && <Badge className="bg-amber-500 text-white border-0 mt-1">Pending</Badge>}
                    {p.status === 'approved' && <Badge className="bg-emerald-500 text-white border-0 mt-1">Approved</Badge>}
                    {p.status === 'rejected' && <Badge variant="destructive" className="mt-1">Rejected</Badge>}
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {p.screenshot_path && <Button variant="outline" size="sm" onClick={() => viewProof(p.screenshot_path)} className="gap-1"><Eye className="w-3.5 h-3.5" /> Screenshot</Button>}
                  {p.status === 'pending' && <>
                    <Button size="sm" onClick={() => approve(p)} className="gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Approve</Button>
                    <Button size="sm" variant="destructive" onClick={() => reject(p)} className="gap-1"><XCircle className="w-3.5 h-3.5" /> Reject</Button>
                  </>}
                </div>
              </CardContent></Card>
            ))}
          </TabsContent>

          <TabsContent value="materials" className="space-y-2">
            {materials.length === 0 ? <p className="text-center text-muted-foreground py-10">No materials yet.</p>
            : materials.map(m => (
              <Card key={m.id} className="modern-card"><CardContent className="p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{m.title}</p>
                  <p className="text-xs text-muted-foreground">{m.is_free ? 'Free' : `₹${m.price_inr}`} • {m.subject || '—'} • {m.class || '—'}</p>
                </div>
                <Button size="sm" variant="destructive" onClick={() => removeMaterial(m.id)}>Delete</Button>
              </CardContent></Card>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
