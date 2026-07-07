import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing auth' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: userRes } = await userClient.auth.getUser();
    const user = userRes?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { material_id } = await req.json();
    if (!material_id) {
      return new Response(JSON.stringify({ error: 'material_id required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: material, error: mErr } = await admin
      .from('materials').select('*').eq('id', material_id).maybeSingle();
    if (mErr || !material) {
      return new Response(JSON.stringify({ error: 'Material not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check admin
    const { data: adminRow } = await admin
      .from('admin_emails').select('email').ilike('email', user.email ?? '').maybeSingle();
    const isAdmin = !!adminRow;

    let allowed = material.is_free || isAdmin;

    if (!allowed) {
      const { data: purchase } = await admin.from('purchases')
        .select('id').eq('user_id', user.id).eq('material_id', material_id).eq('status', 'approved').maybeSingle();
      allowed = !!purchase;
    }

    if (!allowed) {
      return new Response(JSON.stringify({ error: 'Access denied' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: signed, error: sErr } = await admin.storage
      .from('study-materials')
      .createSignedUrl(material.file_path, 60 * 5);
    if (sErr || !signed) {
      return new Response(JSON.stringify({ error: sErr?.message || 'Sign failed' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Auto-record free access
    if (material.is_free && !isAdmin) {
      await admin.from('purchases').upsert({
        user_id: user.id, material_id, amount_inr: 0, final_amount_inr: 0,
        status: 'free',
      } as any, { onConflict: 'user_id,material_id' } as any).select();
    }

    return new Response(JSON.stringify({ url: signed.signedUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
