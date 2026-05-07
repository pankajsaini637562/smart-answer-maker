import { useEffect, useRef, useState } from 'react';
import { Send, Users, Plus, LogOut, Hash, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AppHeader } from '@/components/AppHeader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Group { id: string; name: string; created_by: string; created_at: string; }
interface Message { id: string; group_id: string; user_id: string; user_name: string; text: string; created_at: string; }
interface ProfileLite { display_name: string | null; avatar_url: string | null; }

export default function ChatPage() {
  const { user } = useAuth();
  const [profileName, setProfileName] = useState('Student');
  const [profileAvatar, setProfileAvatar] = useState<string>('');
  const [profilesById, setProfilesById] = useState<Record<string, ProfileLite>>({});
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [joinId, setJoinId] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch own profile
  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('display_name, avatar_url').eq('id', user.id).single()
      .then(({ data }) => {
        if (data?.display_name) setProfileName(data.display_name);
        if ((data as any)?.avatar_url) setProfileAvatar((data as any).avatar_url);
      });
  }, [user]);

  // Resolve sender profiles for messages in view
  useEffect(() => {
    const ids = Array.from(new Set(messages.map(m => m.user_id))).filter(id => !profilesById[id]);
    if (ids.length === 0) return;
    supabase.from('profiles').select('id, display_name, avatar_url').in('id', ids)
      .then(({ data }) => {
        if (!data) return;
        setProfilesById(prev => {
          const next = { ...prev };
          data.forEach((p: any) => { next[p.id] = { display_name: p.display_name, avatar_url: p.avatar_url }; });
          return next;
        });
      });
  }, [messages]);

  // Fetch groups
  const loadGroups = async () => {
    const { data, error } = await supabase.from('groups').select('*').order('created_at', { ascending: true });
    if (error) { toast.error(error.message); return; }
    setGroups(data ?? []);
    if (!activeGroupId && data && data.length > 0) setActiveGroupId(data[0].id);
    setLoading(false);
  };

  useEffect(() => { if (user) loadGroups(); }, [user]);

  // Realtime: groups & group_members changes → reload group list
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('groups-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'groups' }, () => loadGroups())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_members' }, () => loadGroups())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // Fetch messages for active group
  useEffect(() => {
    if (!activeGroupId) { setMessages([]); return; }
    supabase.from('messages').select('*').eq('group_id', activeGroupId).order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (error) { toast.error(error.message); return; }
        setMessages(data ?? []);
      });
  }, [activeGroupId]);

  // Realtime messages for active group
  useEffect(() => {
    if (!activeGroupId) return;
    const channel = supabase
      .channel(`messages-${activeGroupId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `group_id=eq.${activeGroupId}` },
        (payload) => setMessages(prev => [...prev, payload.new as Message])
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeGroupId]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !user || !activeGroupId || sending) return;
    setSending(true);
    const text = input.trim();
    setInput('');
    const { error } = await supabase.from('messages').insert({
      group_id: activeGroupId, user_id: user.id, user_name: profileName, text,
    });
    setSending(false);
    if (error) { toast.error(error.message); setInput(text); }
  };

  const createGroup = async () => {
    if (!newGroupName.trim() || !user) return;
    const { data, error } = await supabase.from('groups').insert({
      name: newGroupName.trim(), created_by: user.id,
    }).select().single();
    if (error) { toast.error(error.message); return; }
    toast.success(`Group "${data.name}" created`);
    setNewGroupName(''); setCreateOpen(false);
    setActiveGroupId(data.id);
  };

  const joinGroup = async () => {
    if (!joinId.trim() || !user) return;
    const { error } = await supabase.from('group_members').insert({
      group_id: joinId.trim(), user_id: user.id, user_name: profileName,
    });
    if (error) { toast.error(error.message); return; }
    toast.success('Joined group!');
    setJoinId(''); setJoinOpen(false);
    setActiveGroupId(joinId.trim());
    loadGroups();
  };

  const leaveGroup = async () => {
    if (!activeGroupId || !user) return;
    const { error } = await supabase.from('group_members').delete()
      .eq('group_id', activeGroupId).eq('user_id', user.id);
    if (error) { toast.error(error.message); return; }
    toast.success('Left group');
    setActiveGroupId(null);
    loadGroups();
  };

  const activeGroup = groups.find(g => g.id === activeGroupId);

  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />

      <div className="flex-1 container py-4 md:py-6 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-4 min-h-0">
        {/* Sidebar */}
        <aside className="modern-card p-4 flex flex-col gap-3 max-h-[40vh] md:max-h-none">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> Groups</h2>
            <div className="flex gap-1">
              <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
                <DialogTrigger asChild><Button size="icon" variant="ghost" className="rounded-lg w-8 h-8" title="Join via ID"><Hash className="w-4 h-4" /></Button></DialogTrigger>
                <DialogContent className="rounded-2xl">
                  <DialogHeader><DialogTitle className="font-display">Join a Group</DialogTitle></DialogHeader>
                  <Input placeholder="Paste group ID" value={joinId} onChange={e => setJoinId(e.target.value)} className="rounded-xl" />
                  <DialogFooter><Button onClick={joinGroup} className="rounded-xl">Join</Button></DialogFooter>
                </DialogContent>
              </Dialog>
              <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger asChild><Button size="icon" variant="ghost" className="rounded-lg w-8 h-8" title="Create group"><Plus className="w-4 h-4" /></Button></DialogTrigger>
                <DialogContent className="rounded-2xl">
                  <DialogHeader><DialogTitle className="font-display">Create Group</DialogTitle></DialogHeader>
                  <Input placeholder="e.g. Physics Doubt Solving" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} className="rounded-xl" />
                  <DialogFooter><Button onClick={createGroup} className="rounded-xl">Create</Button></DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <ScrollArea className="flex-1 -mx-2">
            <div className="px-2 space-y-1">
              {loading ? (
                <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
              ) : groups.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No groups yet.<br/>Create or join one!</p>
              ) : groups.map(g => (
                <button
                  key={g.id}
                  onClick={() => setActiveGroupId(g.id)}
                  className={cn(
                    'w-full text-left p-2.5 rounded-xl text-sm transition-colors truncate',
                    activeGroupId === g.id ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-accent text-foreground'
                  )}
                >
                  # {g.name}
                </button>
              ))}
            </div>
          </ScrollArea>
        </aside>

        {/* Chat */}
        <section className="modern-card flex flex-col min-h-0 overflow-hidden">
          {activeGroup ? (
            <>
              <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-display font-semibold truncate"># {activeGroup.name}</h3>
                  <p className="text-[10px] text-muted-foreground truncate font-mono">ID: {activeGroup.id}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={leaveGroup} className="rounded-lg gap-1 text-xs">
                  <LogOut className="w-3.5 h-3.5" /> Leave
                </Button>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">
                {messages.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-12">Be the first to say hi 👋</p>
                ) : messages.map(m => {
                  const mine = m.user_id === user?.id;
                  return (
                    <div key={m.id} className={cn('flex flex-col max-w-[80%]', mine ? 'ml-auto items-end' : 'items-start')}>
                      {!mine && <span className="text-[11px] text-muted-foreground px-2 mb-0.5">{m.user_name}</span>}
                      <div className={cn(
                        'px-3 py-2 rounded-2xl text-sm break-words',
                        mine ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-accent text-accent-foreground rounded-bl-sm'
                      )}>
                        {m.text}
                      </div>
                      <span className="text-[10px] text-muted-foreground px-2 mt-0.5">{formatTime(m.created_at)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 border-t border-border flex gap-2">
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Type a message…"
                  className="rounded-xl"
                  maxLength={1000}
                />
                <Button onClick={sendMessage} disabled={sending || !input.trim()} className="rounded-xl gap-1">
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-3">
              <div className="w-16 h-16 rounded-3xl bg-accent flex items-center justify-center"><Users className="w-8 h-8 text-accent-foreground" /></div>
              <h3 className="font-display font-bold text-lg">Pick or create a group</h3>
              <p className="text-sm text-muted-foreground max-w-xs">Chat with classmates, share doubts, and study together in real time.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
