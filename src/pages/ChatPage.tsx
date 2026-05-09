import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Send, Plus, Users, Paperclip, Download, Link2, Copy, MessageCircle, FileText,
} from 'lucide-react';

type Group = { id: string; name: string };
type Message = {
  id: string; group_id: string; user_id: string; user_name: string;
  text: string; created_at: string;
};
type GroupFile = {
  id: string; group_id: string; uploaded_by: string; uploader_name: string;
  file_name: string; file_path: string; size_bytes: number; created_at: string;
};
type Profile = { display_name: string | null; avatar_url: string | null };

export default function ChatPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [files, setFiles] = useState<GroupFile[]>([]);
  const [text, setText] = useState('');
  const [profile, setProfile] = useState<Profile>({ display_name: null, avatar_url: null });
  const [profilesById, setProfilesById] = useState<Record<string, Profile>>({});
  const [creatingName, setCreatingName] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteUrl, setInviteUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load my profile
  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('display_name, avatar_url').eq('id', user.id).maybeSingle()
      .then(({ data }) => { if (data) setProfile(data); });
  }, [user]);

  // Load my groups
  const loadGroups = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('groups').select('id, name').order('created_at', { ascending: false });
    if (error) { toast.error(error.message); return; }
    setGroups(data || []);
    if (!activeGroup && data && data.length > 0) setActiveGroup(data[0]);
  };

  useEffect(() => { loadGroups(); /* eslint-disable-next-line */ }, [user]);

  // Auto-join via invite link
  useEffect(() => {
    const token = params.get('invite');
    if (!token || !user) return;
    (async () => {
      const { data, error } = await supabase.rpc('join_group_via_invite', {
        _token: token,
        _user_name: profile.display_name || 'Student',
      });
      if (error) { toast.error(error.message); return; }
      toast.success('Joined group!');
      params.delete('invite'); setParams(params, { replace: true });
      await loadGroups();
      if (data) {
        const { data: g } = await supabase.from('groups').select('id, name').eq('id', data as string).maybeSingle();
        if (g) setActiveGroup(g);
      }
    })();
    // eslint-disable-next-line
  }, [params, user]);

  // Load messages + files for active group
  useEffect(() => {
    if (!activeGroup) { setMessages([]); setFiles([]); return; }
    (async () => {
      const [{ data: msgs }, { data: fls }] = await Promise.all([
        supabase.from('messages').select('*').eq('group_id', activeGroup.id).order('created_at'),
        supabase.from('group_files').select('*').eq('group_id', activeGroup.id).order('created_at', { ascending: false }),
      ]);
      setMessages(msgs || []);
      setFiles(fls || []);
    })();

    const ch = supabase
      .channel(`group-${activeGroup.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `group_id=eq.${activeGroup.id}` },
        (p) => setMessages((m) => [...m, p.new as Message]))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'group_files', filter: `group_id=eq.${activeGroup.id}` },
        (p) => setFiles((f) => [p.new as GroupFile, ...f]))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [activeGroup]);

  // Resolve sender profiles
  useEffect(() => {
    const ids = Array.from(new Set(messages.map((m) => m.user_id))).filter((id) => id && !profilesById[id] && id !== user?.id);
    if (ids.length === 0) return;
    supabase.from('profiles').select('id, display_name, avatar_url').in('id', ids).then(({ data }) => {
      if (!data) return;
      setProfilesById((prev) => {
        const next = { ...prev };
        data.forEach((p: any) => { next[p.id] = { display_name: p.display_name, avatar_url: p.avatar_url }; });
        return next;
      });
    });
  }, [messages, user, profilesById]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const createGroup = async () => {
    if (!user || !creatingName.trim()) return;
    const { data, error } = await supabase
      .from('groups').insert({ name: creatingName.trim(), created_by: user.id })
      .select('id, name').single();
    if (error) { toast.error(error.message); return; }
    toast.success('Group created');
    setCreatingName(''); setCreateOpen(false);
    setGroups((g) => [data, ...g]); setActiveGroup(data);
  };

  const sendMessage = async () => {
    if (!user || !activeGroup || !text.trim()) return;
    const body = text.trim(); setText('');
    const { error } = await supabase.from('messages').insert({
      group_id: activeGroup.id,
      user_id: user.id,
      user_name: profile.display_name || 'Student',
      text: body,
    });
    if (error) { toast.error(error.message); setText(body); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !activeGroup) return;
    if (file.size > 20 * 1024 * 1024) { toast.error('Max 20MB'); return; }
    setUploading(true);
    try {
      const path = `${activeGroup.id}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from('group-files').upload(path, file);
      if (upErr) throw upErr;
      const { error: insErr } = await supabase.from('group_files').insert({
        group_id: activeGroup.id,
        uploaded_by: user.id,
        uploader_name: profile.display_name || 'Student',
        file_name: file.name,
        file_path: path,
        mime_type: file.type,
        size_bytes: file.size,
      });
      if (insErr) throw insErr;
      toast.success('File uploaded');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const downloadFile = async (f: GroupFile) => {
    const { data, error } = await supabase.storage.from('group-files').createSignedUrl(f.file_path, 60);
    if (error) { toast.error(error.message); return; }
    window.open(data.signedUrl, '_blank');
  };

  const createInvite = async () => {
    if (!user || !activeGroup) return;
    const { data, error } = await supabase.from('group_invites').insert({
      group_id: activeGroup.id, created_by: user.id,
    }).select('token').single();
    if (error) { toast.error(error.message); return; }
    const url = `${window.location.origin}/chat?invite=${data.token}`;
    setInviteUrl(url); setInviteOpen(true);
  };

  const copyInvite = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    toast.success('Link copied');
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-primary" /> Study Chat
          </h1>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="w-4 h-4 mr-1" /> New Group</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Group</DialogTitle></DialogHeader>
              <Input
                placeholder="Group name (e.g. Physics Class 12)"
                value={creatingName}
                onChange={(e) => setCreatingName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createGroup()}
              />
              <DialogFooter>
                <Button onClick={createGroup} disabled={!creatingName.trim()}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[260px,1fr] gap-4">
          {/* Groups list */}
          <Card className="p-3 h-[70vh] overflow-y-auto">
            <p className="text-xs uppercase text-muted-foreground mb-2 px-1">Your Groups</p>
            {groups.length === 0 && (
              <p className="text-sm text-muted-foreground p-2">No groups yet. Create one to start.</p>
            )}
            {groups.map((g) => (
              <button
                key={g.id}
                onClick={() => setActiveGroup(g)}
                className={`w-full text-left px-3 py-2 rounded-lg mb-1 flex items-center gap-2 text-sm transition ${
                  activeGroup?.id === g.id ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                }`}
              >
                <Users className="w-4 h-4 shrink-0" />
                <span className="truncate">{g.name}</span>
              </button>
            ))}
          </Card>

          {/* Active group */}
          <Card className="h-[70vh] flex flex-col">
            {!activeGroup ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Select or create a group
              </div>
            ) : (
              <Tabs defaultValue="chat" className="flex-1 flex flex-col">
                <div className="flex items-center justify-between border-b px-3 py-2">
                  <div>
                    <p className="font-display font-semibold">{activeGroup.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={createInvite}>
                      <Link2 className="w-4 h-4 mr-1" /> Invite
                    </Button>
                    <TabsList>
                      <TabsTrigger value="chat"><MessageCircle className="w-4 h-4" /></TabsTrigger>
                      <TabsTrigger value="files"><FileText className="w-4 h-4" /></TabsTrigger>
                    </TabsList>
                  </div>
                </div>

                <TabsContent value="chat" className="flex-1 flex flex-col m-0 data-[state=inactive]:hidden">
                  <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.length === 0 && (
                      <p className="text-center text-sm text-muted-foreground">No messages yet — say hi!</p>
                    )}
                    {messages.map((m) => {
                      const mine = m.user_id === user?.id;
                      const live = mine
                        ? profile
                        : profilesById[m.user_id];
                      const name = live?.display_name || m.user_name || 'Student';
                      const avatar = live?.avatar_url || '';
                      return (
                        <div key={m.id} className={`flex gap-2 ${mine ? 'flex-row-reverse' : ''}`}>
                          <Avatar className="w-8 h-8 shrink-0">
                            {avatar && <AvatarImage src={avatar} />}
                            <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className={`max-w-[75%] ${mine ? 'items-end' : 'items-start'} flex flex-col`}>
                            <span className="text-[10px] text-muted-foreground px-1">{name}</span>
                            <div className={`px-3 py-2 rounded-2xl text-sm ${
                              mine ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-accent rounded-bl-sm'
                            }`}>
                              {m.text}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t p-2 flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <Button onClick={sendMessage} disabled={!text.trim()}><Send className="w-4 h-4" /></Button>
                  </div>
                </TabsContent>

                <TabsContent value="files" className="flex-1 flex flex-col m-0 data-[state=inactive]:hidden">
                  <div className="p-3 border-b flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      hidden
                      onChange={handleFileUpload}
                    />
                    <Button
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      <Paperclip className="w-4 h-4 mr-1" />
                      {uploading ? 'Uploading...' : 'Upload File'}
                    </Button>
                    <span className="text-xs text-muted-foreground">Max 20MB</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {files.length === 0 && (
                      <p className="text-center text-sm text-muted-foreground">No files shared yet.</p>
                    )}
                    {files.map((f) => (
                      <div key={f.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                        <FileText className="w-5 h-5 text-primary shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{f.file_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {f.uploader_name} • {(f.size_bytes / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => downloadFile(f)}>
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </Card>
        </div>
      </div>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Invite Link</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Share this link to invite others to the group.</p>
          <div className="flex gap-2">
            <Input value={inviteUrl} readOnly />
            <Button onClick={copyInvite}><Copy className="w-4 h-4" /></Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
