import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AppHeader } from '@/components/AppHeader';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Send, Plus, Users, Paperclip, Download, Link2, Copy, MessageCircle, FileText,
  Search, ArrowLeft, Compass, User as UserIcon, LogOut, Camera, Image as ImageIcon, Globe, Lock,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type Group = {
  id: string; name: string; description?: string | null;
  avatar_url?: string | null; is_public?: boolean; created_by: string; created_at: string;
};
type GroupWithMeta = Group & { member_count: number; is_member: boolean };
type Message = {
  id: string; group_id: string; user_id: string; user_name: string;
  text: string; created_at: string;
};
type GroupFile = {
  id: string; group_id: string; uploaded_by: string; uploader_name: string;
  file_name: string; file_path: string; size_bytes: number; created_at: string;
};
type Profile = { id?: string; display_name: string | null; avatar_url: string | null };
type Member = { user_id: string; user_name: string; joined_at: string };

export default function ChatPage() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();

  const [tab, setTab] = useState<'chats' | 'discover' | 'profile'>('chats');
  const [allGroups, setAllGroups] = useState<GroupWithMeta[]>([]);
  const [activeGroup, setActiveGroup] = useState<GroupWithMeta | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [files, setFiles] = useState<GroupFile[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [text, setText] = useState('');
  const [profile, setProfile] = useState<Profile>({ display_name: null, avatar_url: null });
  const [profilesById, setProfilesById] = useState<Record<string, Profile>>({});
  const [search, setSearch] = useState('');
  const [discoverSearch, setDiscoverSearch] = useState('');

  // Create-group dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPublic, setNewPublic] = useState(true);
  const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);

  // Invite + members dialogs
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteUrl, setInviteUrl] = useState('');
  const [membersOpen, setMembersOpen] = useState(false);

  // Profile editing
  const [editName, setEditName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pendingAvatar, setPendingAvatar] = useState<File | null>(null);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const groupAvatarInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // -------- Profile --------
  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('display_name, avatar_url').eq('id', user.id).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setProfile(data);
          setEditName(data.display_name || '');
        }
      });
  }, [user]);

  // -------- Load groups (all visible + membership map) --------
  const loadGroups = async () => {
    if (!user) return;
    const [{ data: groups, error }, { data: myMembers }] = await Promise.all([
      supabase.from('groups')
        .select('id, name, description, avatar_url, is_public, created_by, created_at')
        .order('created_at', { ascending: false }),
      supabase.from('group_members').select('group_id').eq('user_id', user.id),
    ]);
    if (error) { toast.error(error.message); return; }
    const memberSet = new Set((myMembers || []).map((m) => m.group_id));
    const list = groups || [];
    // Get member counts in parallel
    const counts = await Promise.all(
      list.map((g) => supabase.rpc('group_member_count', { _group_id: g.id }))
    );
    const enriched: GroupWithMeta[] = list.map((g, i) => ({
      ...g,
      member_count: (counts[i].data as number) ?? 0,
      is_member: memberSet.has(g.id) || g.created_by === user.id,
    }));
    setAllGroups(enriched);
    if (activeGroup) {
      const fresh = enriched.find((g) => g.id === activeGroup.id);
      if (fresh) setActiveGroup(fresh);
    }
  };

  useEffect(() => { loadGroups(); /* eslint-disable-next-line */ }, [user]);

  const joinedGroups = useMemo(
    () => allGroups.filter((g) => g.is_member && g.name.toLowerCase().includes(search.toLowerCase())),
    [allGroups, search]
  );
  const discoverGroups = useMemo(
    () => allGroups.filter((g) => g.is_public && !g.is_member && g.name.toLowerCase().includes(discoverSearch.toLowerCase())),
    [allGroups, discoverSearch]
  );

  // -------- Auto-join via invite link --------
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
        const found = allGroups.find((g) => g.id === (data as string));
        if (found) { setActiveGroup({ ...found, is_member: true }); setTab('chats'); }
      }
    })();
    // eslint-disable-next-line
  }, [params, user]);

  // -------- Active group: messages + files + realtime --------
  useEffect(() => {
    if (!activeGroup) { setMessages([]); setFiles([]); setMembers([]); return; }
    (async () => {
      const [{ data: msgs }, { data: fls }, { data: mems }] = await Promise.all([
        supabase.from('messages').select('*').eq('group_id', activeGroup.id).order('created_at'),
        supabase.from('group_files').select('*').eq('group_id', activeGroup.id).order('created_at', { ascending: false }),
        supabase.from('group_members').select('user_id, user_name, joined_at').eq('group_id', activeGroup.id),
      ]);
      setMessages(msgs || []);
      setFiles(fls || []);
      setMembers(mems || []);
    })();

    const ch = supabase
      .channel(`group-${activeGroup.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `group_id=eq.${activeGroup.id}` },
        (p) => setMessages((m) => [...m, p.new as Message]))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'group_files', filter: `group_id=eq.${activeGroup.id}` },
        (p) => setFiles((f) => [p.new as GroupFile, ...f]))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'group_members', filter: `group_id=eq.${activeGroup.id}` },
        (p) => setMembers((m) => [...m, p.new as Member]))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [activeGroup]);

  // Resolve sender profiles for avatars/names
  useEffect(() => {
    const ids = Array.from(new Set(messages.map((m) => m.user_id)))
      .filter((id) => id && !profilesById[id] && id !== user?.id);
    if (ids.length === 0) return;
    supabase.rpc('get_group_member_profiles', { _ids: ids }).then(({ data }) => {
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
  }, [messages, activeGroup]);

  // -------- Actions --------
  const uploadGroupAvatar = async (groupId: string, file: File): Promise<string | null> => {
    const path = `group-avatars/${groupId}-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (error) { toast.error(error.message); return null; }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    return data.publicUrl;
  };

  const createGroup = async () => {
    if (!user || !newName.trim()) return;
    setCreating(true);
    try {
      const { data, error } = await supabase
        .from('groups').insert({
          name: newName.trim(),
          description: newDesc.trim(),
          is_public: newPublic,
          created_by: user.id,
        })
        .select('id, name, description, avatar_url, is_public, created_by, created_at').single();
      if (error) throw error;

      let avatarUrl: string | null = null;
      if (newAvatarFile) {
        avatarUrl = await uploadGroupAvatar(data.id, newAvatarFile);
        if (avatarUrl) {
          await supabase.from('groups').update({ avatar_url: avatarUrl }).eq('id', data.id);
        }
      }
      toast.success('Group created');
      setNewName(''); setNewDesc(''); setNewPublic(true); setNewAvatarFile(null);
      setCreateOpen(false);
      await loadGroups();
      const created: GroupWithMeta = { ...data, avatar_url: avatarUrl ?? data.avatar_url, member_count: 1, is_member: true };
      setActiveGroup(created);
      setTab('chats');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create');
    } finally {
      setCreating(false);
    }
  };

  const joinGroup = async (g: GroupWithMeta) => {
    if (!user) return;
    setJoiningId(g.id);
    const { error } = await supabase.from('group_members').insert({
      group_id: g.id, user_id: user.id, user_name: profile.display_name || 'Student',
    });
    setJoiningId(null);
    if (error) { toast.error(error.message); return; }
    toast.success(`Joined ${g.name}`);
    await loadGroups();
    setActiveGroup({ ...g, is_member: true, member_count: g.member_count + 1 });
    setTab('chats');
  };

  const leaveGroup = async (g: GroupWithMeta) => {
    if (!user) return;
    const { error } = await supabase.from('group_members').delete().eq('group_id', g.id).eq('user_id', user.id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Left ${g.name}`);
    setActiveGroup(null);
    await loadGroups();
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

  // Profile actions
  const onAvatarPicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return; }
    if (!file.type.startsWith('image/')) { toast.error('Please pick an image'); return; }
    setPendingAvatar(file);
  };

  const saveAvatar = async () => {
    if (!user || !pendingAvatar) return;
    setSavingAvatar(true);
    try {
      const ext = pendingAvatar.name.split('.').pop() || 'jpg';
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, pendingAvatar, { upsert: true });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
      const { error: updErr } = await supabase.from('profiles').update({ avatar_url: pub.publicUrl }).eq('id', user.id);
      if (updErr) throw updErr;
      setProfile((p) => ({ ...p, avatar_url: pub.publicUrl }));
      // Reflect instantly in any rendered chat (own messages use `profile`; others use profilesById)
      setProfilesById((prev) => ({ ...prev, [user.id]: { display_name: profile.display_name, avatar_url: pub.publicUrl } }));
      setPendingAvatar(null);
      toast.success('Profile photo updated');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setSavingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const saveDisplayName = async () => {
    if (!user || !editName.trim()) return;
    setSavingProfile(true);
    const trimmed = editName.trim();
    const { error } = await supabase.from('profiles').update({ display_name: trimmed }).eq('id', user.id);
    setSavingProfile(false);
    if (error) { toast.error(error.message); return; }
    setProfile((p) => ({ ...p, display_name: trimmed }));
    setProfilesById((prev) => ({ ...prev, [user.id]: { display_name: trimmed, avatar_url: profile.avatar_url } }));
    toast.success('Profile updated');
  };

  const initials = (n?: string | null) => (n || 'S').trim().charAt(0).toUpperCase();

  // -------- Sub-views --------
  const GroupRow = ({ g, action }: { g: GroupWithMeta; action: 'open' | 'join' }) => {
    const isJoining = joiningId === g.id;
    return (
      <div className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-accent/60 transition text-left">
        <button
          onClick={() => action === 'open' ? setActiveGroup(g) : undefined}
          className="flex items-center gap-3 flex-1 min-w-0 text-left"
          disabled={action === 'join'}
        >
          <Avatar className="w-12 h-12 shrink-0">
            {g.avatar_url && <AvatarImage src={g.avatar_url} />}
            <AvatarFallback className="bg-primary/15 text-primary"><Users className="w-5 h-5" /></AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium truncate">{g.name}</p>
              {g.is_public ? <Globe className="w-3 h-3 text-muted-foreground shrink-0" /> : <Lock className="w-3 h-3 text-muted-foreground shrink-0" />}
            </div>
            {g.description ? (
              <p className="text-xs text-muted-foreground line-clamp-1">{g.description}</p>
            ) : null}
            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
              <Users className="w-3 h-3" /> {g.member_count} member{g.member_count === 1 ? '' : 's'}
            </p>
          </div>
        </button>
        {action === 'join' ? (
          <Button
            size="sm"
            onClick={() => joinGroup(g)}
            disabled={isJoining || joiningId !== null}
            className="shrink-0"
          >
            {isJoining ? 'Joining...' : 'Join'}
          </Button>
        ) : (
          <button onClick={() => setActiveGroup(g)} className="text-[10px] text-muted-foreground shrink-0 px-1">
            Open
          </button>
        )}
      </div>
    );
  };

  // -------- Render --------
  const showSidebar = !activeGroup; // mobile: hide list when in chat

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Study Chat | Smart AI OMR Analysis" description="Collaborate with study groups and chat with the AI coach for exam doubts." />
      <AppHeader />
      <main className="container mx-auto px-2 sm:px-4 py-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-[320px,1fr] gap-3">
          {/* LEFT: tabs (chats / discover / profile) */}
          <Card className={`md:h-[78vh] h-[calc(100vh-160px)] flex flex-col ${activeGroup ? 'hidden md:flex' : 'flex'}`}>
            <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="flex-1 flex flex-col">
              <div className="p-3 border-b">
                <h1 className="text-xl font-display font-bold flex items-center gap-2 mb-3">
                  <MessageCircle className="w-5 h-5 text-primary" /> Study Chat
                </h1>
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="chats"><MessageCircle className="w-4 h-4 mr-1" />Chats</TabsTrigger>
                  <TabsTrigger value="discover"><Compass className="w-4 h-4 mr-1" />Discover</TabsTrigger>
                  <TabsTrigger value="profile"><UserIcon className="w-4 h-4 mr-1" />Me</TabsTrigger>
                </TabsList>
              </div>

              {/* CHATS TAB */}
              <TabsContent value="chats" className="flex-1 m-0 overflow-hidden flex flex-col data-[state=inactive]:hidden">
                <div className="p-3 flex gap-2 border-b">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground" />
                    <Input className="pl-8 h-9" placeholder="Search joined groups" value={search} onChange={(e) => setSearch(e.target.value)} />
                  </div>
                  <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogTrigger asChild>
                      <Button size="icon" className="h-9 w-9 shrink-0"><Plus className="w-4 h-4" /></Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>New Group</DialogTitle>
                        <DialogDescription>Create a study group. Public groups appear in Discover.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-16 h-16">
                            {newAvatarFile ? <AvatarImage src={URL.createObjectURL(newAvatarFile)} /> : <AvatarFallback><Users className="w-6 h-6" /></AvatarFallback>}
                          </Avatar>
                          <Button size="sm" variant="outline" onClick={() => groupAvatarInputRef.current?.click()}>
                            <ImageIcon className="w-4 h-4 mr-1" /> {newAvatarFile ? 'Change' : 'Photo'}
                          </Button>
                          <input ref={groupAvatarInputRef} type="file" accept="image/*" hidden
                            onChange={(e) => setNewAvatarFile(e.target.files?.[0] || null)} />
                        </div>
                        <Input placeholder="Group name (e.g. Physics Class 12)" value={newName} onChange={(e) => setNewName(e.target.value)} />
                        <Textarea placeholder="Description (optional)" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={2} />
                        <div className="flex items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <Label className="flex items-center gap-2">{newPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />} {newPublic ? 'Public' : 'Private'}</Label>
                            <p className="text-xs text-muted-foreground">{newPublic ? 'Anyone can find and join' : 'Invite-only'}</p>
                          </div>
                          <Switch checked={newPublic} onCheckedChange={setNewPublic} />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={createGroup} disabled={!newName.trim() || creating}>
                          {creating ? 'Creating...' : 'Create'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                  {joinedGroups.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground p-6">
                      No groups yet. Tap <Plus className="inline w-3 h-3" /> to create or check Discover.
                    </div>
                  )}
                  {joinedGroups.map((g) => <GroupRow key={g.id} g={g} action="open" />)}
                </div>
              </TabsContent>

              {/* DISCOVER TAB */}
              <TabsContent value="discover" className="flex-1 m-0 overflow-hidden flex flex-col data-[state=inactive]:hidden">
                <div className="p-3 border-b">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground" />
                    <Input className="pl-8 h-9" placeholder="Search public groups" value={discoverSearch} onChange={(e) => setDiscoverSearch(e.target.value)} />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                  {discoverGroups.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground p-6">No public groups to discover yet.</div>
                  )}
                  {discoverGroups.map((g) => <GroupRow key={g.id} g={g} action="join" />)}
                </div>
              </TabsContent>

              {/* PROFILE TAB */}
              <TabsContent value="profile" className="flex-1 m-0 overflow-y-auto p-4 space-y-4 data-[state=inactive]:hidden">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="relative">
                    <Avatar className="w-24 h-24 ring-2 ring-primary/30">
                      {pendingAvatar ? (
                        <AvatarImage src={URL.createObjectURL(pendingAvatar)} />
                      ) : profile.avatar_url ? (
                        <AvatarImage src={profile.avatar_url} />
                      ) : null}
                      <AvatarFallback className="text-2xl bg-primary/15 text-primary">{initials(profile.display_name)}</AvatarFallback>
                    </Avatar>
                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 shadow-lg hover:scale-105 transition"
                      aria-label="Change photo"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <input ref={avatarInputRef} type="file" accept="image/*" hidden onChange={onAvatarPicked} />
                  </div>
                  {pendingAvatar ? (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveAvatar} disabled={savingAvatar}>
                        {savingAvatar ? 'Saving...' : 'Save photo'}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setPendingAvatar(null)} disabled={savingAvatar}>Cancel</Button>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Tap the camera to change photo (max 5MB)</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Display name</Label>
                  <div className="flex gap-2">
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Your name" />
                    <Button onClick={saveDisplayName} disabled={savingProfile || !editName.trim()}>Save</Button>
                  </div>
                </div>
                <div className="rounded-lg border p-3 text-sm space-y-1">
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">Stats</p>
                  <p>Joined groups: <strong>{allGroups.filter((g) => g.is_member).length}</strong></p>
                  <p>Created groups: <strong>{allGroups.filter((g) => g.created_by === user?.id).length}</strong></p>
                </div>
              </TabsContent>
            </Tabs>
          </Card>

          {/* RIGHT: active chat */}
          <Card className={`md:h-[78vh] h-[calc(100vh-160px)] flex flex-col ${activeGroup ? 'flex' : 'hidden md:flex'}`}>
            {!activeGroup ? (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-2 p-8 text-center">
                <MessageCircle className="w-12 h-12 opacity-30" />
                <p className="font-medium">Pick a chat to start messaging</p>
                <p className="text-xs">Or discover new study groups in the Discover tab.</p>
              </div>
            ) : (
              <Tabs defaultValue="chat" className="flex-1 flex flex-col">
                {/* Header */}
                <div className="flex items-center gap-2 border-b px-2 py-2">
                  <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setActiveGroup(null)}>
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <button onClick={() => setMembersOpen(true)} className="flex items-center gap-2 flex-1 min-w-0 hover:opacity-80">
                    <Avatar className="w-9 h-9">
                      {activeGroup.avatar_url && <AvatarImage src={activeGroup.avatar_url} />}
                      <AvatarFallback className="bg-primary/15 text-primary"><Users className="w-4 h-4" /></AvatarFallback>
                    </Avatar>
                    <div className="text-left min-w-0">
                      <p className="font-display font-semibold truncate">{activeGroup.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {members.length} member{members.length === 1 ? '' : 's'} • tap for info
                      </p>
                    </div>
                  </button>
                  <div className="flex items-center gap-1">
                    {activeGroup.is_member && (
                      <Button size="sm" variant="outline" onClick={createInvite} className="hidden sm:inline-flex">
                        <Link2 className="w-4 h-4 mr-1" /> Invite
                      </Button>
                    )}
                    <TabsList>
                      <TabsTrigger value="chat"><MessageCircle className="w-4 h-4" /></TabsTrigger>
                      <TabsTrigger value="files"><FileText className="w-4 h-4" /></TabsTrigger>
                    </TabsList>
                  </div>
                </div>

                {!activeGroup.is_member ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
                    <Users className="w-10 h-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{activeGroup.description || 'Join this public group to start chatting.'}</p>
                    <Button onClick={() => joinGroup(activeGroup)}>Join {activeGroup.name}</Button>
                  </div>
                ) : (
                  <>
                    <TabsContent value="chat" className="flex-1 flex flex-col m-0 data-[state=inactive]:hidden overflow-hidden">
                      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2.5">
                        {messages.length === 0 && (
                          <p className="text-center text-sm text-muted-foreground pt-6">No messages yet — say hi! 👋</p>
                        )}
                        {messages.map((m, i) => {
                          const mine = m.user_id === user?.id;
                          const live = mine ? profile : profilesById[m.user_id];
                          const name = live?.display_name || m.user_name || 'Student';
                          const avatar = live?.avatar_url || '';
                          const prev = messages[i - 1];
                          const showHeader = !prev || prev.user_id !== m.user_id;
                          return (
                            <div key={m.id} className={`flex gap-2 ${mine ? 'flex-row-reverse' : ''}`}>
                              <div className="w-8 shrink-0">
                                {showHeader && (
                                  <Avatar className="w-8 h-8">
                                    {avatar && <AvatarImage src={avatar} />}
                                    <AvatarFallback>{initials(name)}</AvatarFallback>
                                  </Avatar>
                                )}
                              </div>
                              <div className={`max-w-[78%] flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                                {showHeader && !mine && (
                                  <span className="text-[10px] text-muted-foreground px-1 mb-0.5">{name}</span>
                                )}
                                <div className={`px-3 py-2 rounded-2xl text-sm break-words shadow-sm ${
                                  mine
                                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                                    : 'bg-accent rounded-bl-sm'
                                }`}>
                                  {m.text}
                                </div>
                                <span className="text-[10px] text-muted-foreground px-1 mt-0.5">
                                  {formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="border-t p-2 flex gap-2 items-end">
                        <input ref={fileInputRef} type="file" hidden onChange={handleFileUpload} />
                        <Button size="icon" variant="ghost" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="shrink-0">
                          <Paperclip className="w-4 h-4" />
                        </Button>
                        <Input
                          placeholder="Type a message..."
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                        />
                        <Button onClick={sendMessage} disabled={!text.trim()} size="icon" className="shrink-0">
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="files" className="flex-1 flex flex-col m-0 data-[state=inactive]:hidden">
                      <div className="p-3 border-b flex items-center gap-2">
                        <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
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
                  </>
                )}
              </Tabs>
            )}
          </Card>
        </div>
      </div>

      {/* Invite dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Link</DialogTitle>
            <DialogDescription>Share this link to invite others to the group.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Input value={inviteUrl} readOnly />
            <Button onClick={copyInvite}><Copy className="w-4 h-4" /></Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Group info / members dialog */}
      <Dialog open={membersOpen} onOpenChange={setMembersOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                {activeGroup?.avatar_url && <AvatarImage src={activeGroup.avatar_url} />}
                <AvatarFallback><Users className="w-4 h-4" /></AvatarFallback>
              </Avatar>
              {activeGroup?.name}
            </DialogTitle>
            <DialogDescription>{activeGroup?.description || 'Group info & members'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {members.map((m) => {
              const live = m.user_id === user?.id ? profile : profilesById[m.user_id];
              const name = live?.display_name || m.user_name;
              return (
                <div key={m.user_id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent">
                  <Avatar className="w-9 h-9">
                    {live?.avatar_url && <AvatarImage src={live.avatar_url} />}
                    <AvatarFallback>{initials(name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {name} {m.user_id === user?.id && <span className="text-xs text-muted-foreground">(You)</span>}
                    </p>
                    <p className="text-[11px] text-muted-foreground">Joined {formatDistanceToNow(new Date(m.joined_at), { addSuffix: true })}</p>
                  </div>
                  {m.user_id === activeGroup?.created_by && <Badge variant="secondary" className="text-[10px]">Admin</Badge>}
                </div>
              );
            })}
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {activeGroup && activeGroup.is_member && (
              <Button variant="outline" onClick={createInvite} className="w-full sm:w-auto">
                <Link2 className="w-4 h-4 mr-1" /> Invite Link
              </Button>
            )}
            {activeGroup && activeGroup.is_member && activeGroup.created_by !== user?.id && (
              <Button variant="destructive" onClick={() => { setMembersOpen(false); leaveGroup(activeGroup); }} className="w-full sm:w-auto">
                <LogOut className="w-4 h-4 mr-1" /> Leave Group
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
