import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { getPendingReferral, clearPendingReferral } from '@/lib/referral';

async function attachReferralByCode(userId: string, explicitCode?: string): Promise<{ referrerId: string | null }> {
  const code = (explicitCode || getPendingReferral() || '').toUpperCase();
  if (!code) return { referrerId: null };
  const { data: referrer } = await supabase
    .from('profiles').select('id').eq('referral_code', code).maybeSingle();
  let referrerId: string | null = null;
  if (referrer?.id && referrer.id !== userId) {
    await supabase.from('profiles').update({ referred_by: referrer.id } as any).eq('id', userId);
    referrerId = referrer.id;
  }
  clearPendingReferral();
  return { referrerId };
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, studentClass: string, country: string, school?: string, phone?: string, referralCode?: string) => Promise<{ error: any; referrerId?: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
  signInAnonymously: (name: string, studentClass: string, country: string, school?: string, phone?: string, referralCode?: string) => Promise<{ error: any; referrerId?: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string, studentClass: string, country: string, school?: string, phone?: string, referralCode?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { display_name: name, class: studentClass, country, school: school || '', phone: phone || '' },
      },
    });
    if (error) return { error };

    let referrerId: string | null = null;
    if (data.user) {
      await supabase.from('profiles').update({
        display_name: name,
        class: studentClass,
        country,
        school: school || '',
        phone: phone || '',
        updated_at: new Date().toISOString(),
      } as any).eq('id', data.user.id);
      const r = await attachReferralByCode(data.user.id, referralCode);
      referrerId = r.referrerId;
    }
    return { error: null, referrerId };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error };
  };

  const signInAnonymously = async (name: string, studentClass: string, country: string, school?: string, phone?: string) => {
    const { data, error } = await supabase.auth.signInAnonymously({
      options: { data: { display_name: name } },
    });
    if (error) return { error };

    if (data.user) {
      await supabase.from('profiles').update({
        display_name: name,
        class: studentClass,
        country,
        school: school || '',
        phone: phone || '',
        updated_at: new Date().toISOString(),
      } as any).eq('id', data.user.id);
      await attachReferralByCode(data.user.id);
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, resetPassword, updatePassword, signInAnonymously, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
