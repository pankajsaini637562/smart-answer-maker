import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useIsAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    async function check() {
      if (!user?.id) { setIsAdmin(false); setLoading(false); return; }
      const { data } = await supabase.rpc('is_admin', { _uid: user.id });
      if (!cancel) { setIsAdmin(!!data); setLoading(false); }
    }
    check();
    return () => { cancel = true; };
  }, [user?.id]);

  return { isAdmin, loading };
}
