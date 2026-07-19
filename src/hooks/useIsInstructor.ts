import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useIsAdmin } from './useIsAdmin';

export function useIsInstructor() {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const [isInstructor, setIsInstructor] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!user) { setIsInstructor(false); setLoading(false); return; }
    supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'instructor').maybeSingle()
      .then(({ data }) => { setIsInstructor(!!data || isAdmin); setLoading(false); });
  }, [user, isAdmin]);
  return { isInstructor: isInstructor || isAdmin, loading };
}
