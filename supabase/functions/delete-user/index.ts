import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const authHeader = req.headers.get('Authorization') ?? '';

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: me, error: meErr } = await userClient.auth.getUser();
  if (meErr || !me?.user) {
    return new Response('Unauthorized', { status: 401, headers: corsHeaders });
  }

  const { data: roleRow, error: roleErr } = await userClient
    .from('users')
    .select('role_id, roles(name)')
    .eq('id', me.user.id)
    .maybeSingle();

  if (roleErr) {
    return new Response('Unable to verify role', { status: 500, headers: corsHeaders });
  }

  const myRole = roleRow?.roles?.name as string | undefined;
  const allowedRoles = ['Admin', 'Data Åpmand', 'Regisjef'];

  if (!myRole || !allowedRoles.includes(myRole)) {
    return new Response('Forbidden', { status: 403, headers: corsHeaders });
  }

  const body = (await req.json().catch(() => null)) as { userId: string } | null;
  if (!body?.userId) {
    return new Response('Bad Request: userId required', { status: 400, headers: corsHeaders });
  }

  if (body.userId === me.user.id) {
    return new Response('Kan ikke slette din egen bruker', { status: 400, headers: corsHeaders });
  }

  const adminClient = createClient(supabaseUrl, serviceKey);

  // Prevent deletion of admin users
  const { data: targetRole } = await adminClient
    .from('users')
    .select('roles(name)')
    .eq('id', body.userId)
    .maybeSingle();

  const targetRoleName = (targetRole?.roles as any)?.name as string | undefined;
  if (targetRoleName === 'Admin') {
    return new Response('Kan ikke slette admin-brukere', { status: 403, headers: corsHeaders });
  }

  // Delete auth user first; ignore "not found" since user may only exist in the users table
  const { error: authErr } = await adminClient.auth.admin.deleteUser(body.userId);

  if (authErr && !authErr.message.toLowerCase().includes('not found')) {
    return new Response(authErr.message, { status: 400, headers: corsHeaders });
  }

  const { error: profileErr } = await adminClient.from('users').delete().eq('id', body.userId);

  if (profileErr) {
    return new Response(profileErr.message, { status: 400, headers: corsHeaders });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
