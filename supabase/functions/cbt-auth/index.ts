import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.101.1';

const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info', 'Content-Type': 'application/json' };
const respond = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });
Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'POST') return respond({ error: 'Method not allowed' }, 405);
  try {
    const url = Deno.env.get('SUPABASE_URL');
    const anon = Deno.env.get('SUPABASE_ANON_KEY');
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !anon || !key) return respond({ error: 'Sign-in is temporarily unavailable' }, 503);
    const admin = createClient(url, key, { auth: { persistSession: false } });
    const client = createClient(url, anon, { auth: { persistSession: false } });
    const body = await req.json();
    const roll = String(body.roll_number ?? '').trim().toUpperCase();
    const action = body.action ?? 'login';
    const digest = async (s: string) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))).map(x => x.toString(16).padStart(2,'0')).join('');
    // The gateway-provided address is only used to tighten the per-roll limiter.
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const [perRoll, perIp] = await Promise.all([
      admin.rpc('cbt_login_allow', { _key: await digest(`roll:${roll}`) }),
      admin.rpc('cbt_login_allow', { _key: await digest(`ip:${ip}`) }),
    ]);
    if (perRoll.error || perIp.error || !perRoll.data || !perIp.data) return respond({ error: 'Too many requests. Try again in 15 minutes.' }, 429);
    if (action === 'admin-recovery') {
      const token = req.headers.get('Authorization')?.replace(/^Bearer /i,'');
      if (!token) return respond({ error: 'Unauthorized' }, 401);
      const { data: identity, error } = await admin.auth.getUser(token);
      if (error || !identity.user || identity.user.is_anonymous) return respond({ error: 'Unauthorized' }, 401);
      const { data: allowed } = await admin.rpc('is_admin', { _uid: identity.user.id });
      if (!allowed) return respond({ error: 'Administrators only' }, 403);
      const { data: student } = await admin.from('cbt_students').select('user_id').eq('roll_number',roll).maybeSingle();
      if (!student) return respond({ error: 'Student not found' }, 404);
      const { data: target } = await admin.auth.admin.getUserById(student.user_id);
      if (!target.user?.email) return respond({ error: 'No recovery email is available' }, 400);
      const redirect = String(body.redirect_to ?? '');
      let origin: URL;
      try { origin = new URL(redirect); } catch { return respond({ error: 'Invalid recovery address' }, 400); }
      if (origin.pathname !== '/reset-password' || origin.search || origin.hash || origin.username || origin.password || !(origin.protocol === 'https:' || (origin.protocol === 'http:' && origin.hostname === 'localhost'))) return respond({ error: 'Invalid recovery address' }, 400);
      // Auth's configured redirect allowlist remains authoritative.
      const { error: recoveryError } = await client.auth.resetPasswordForEmail(target.user.email, { redirectTo: redirect });
      if (recoveryError) return respond({ error: 'Recovery could not be sent' }, 400);
      await admin.from('cbt_audit_events').insert({ user_id: identity.user.id, event: 'student_recovery_requested', details: { student_id: student.user_id } });
      return respond({ sent: true });
    }
    if (action !== 'login' || !/^(STL-\d{4}-\d{6,}|[A-Z0-9]{1,10}-\d{4,})$/.test(roll) || typeof body.password !== 'string' || body.password.length > 200) return respond({ error: 'Invalid roll number or password' }, 401);
    const { data: student } = await admin.from('cbt_students').select('user_id,status').eq('roll_number',roll).maybeSingle();
    if (student && student.status !== 'approved') return respond({ error: 'This account is not active. Contact your institute.' }, 403);
    const target = student ? await admin.auth.admin.getUserById(student.user_id) : null;
    if (!target?.data.user?.email) return respond({ error: 'Invalid roll number or password' }, 401);
    const { data, error } = await client.auth.signInWithPassword({ email: target.data.user.email, password: body.password });
    if (error || !data.session) return respond({ error: 'Invalid roll number or password' }, 401);
    return respond({ access_token: data.session.access_token, refresh_token: data.session.refresh_token });
  } catch { return respond({ error: 'Unable to process request' }, 400); }
});