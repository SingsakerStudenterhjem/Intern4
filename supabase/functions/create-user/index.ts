// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type AddressInput = {
  street?: string;
  postalCode?: string;
  city?: string;
  country?: string;
};

type CreateUserInput = {
  email: string;
  name: string;
  phone?: string;
  birthDate?: string; // ISO date string "YYYY-MM-DD"
  address?: AddressInput;
  study?: string;
  studyPlace?: string;
  profilePicture?: string;
  seniority?: number;
  roomNumber?: number;
  onLeave?: boolean;
  isActive?: boolean;
};

function generatePassword(length = 12): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders,
    });
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
    .from('user_roles')
    .select('roles(name)')
    .eq('user_uuid', me.user.id)
    .maybeSingle();

  if (roleErr || !meRow || !meRow.roles) {
    return new Response('Forbidden', { status: 403, headers: corsHeaders });
  }

  const myRole = (meRow as any).roles.name as string;

  const allowedRoles = ['Data Åpmand', 'Regisjef'];

  if (!allowedRoles.includes(myRole)) {
    return new Response('Forbidden', { status: 403, headers: corsHeaders });
  }

  const body = (await req.json().catch(() => null)) as CreateUserInput | null;
  if (!body || !body.email || !body.name) {
    return new Response('Bad Request: name and email required', {
      status: 400,
      headers: corsHeaders,
    });
  }

  const password = generatePassword();

  const adminClient = createClient(supabaseUrl, serviceKey);

  const { data: created, error: createErr } = await adminClient.auth.admin.createUser({
    email: body.email,
    password,
    email_confirm: true,
    user_metadata: { name: body.name },
  });

  if (createErr || !created?.user) {
    const msg = createErr?.message ?? 'Failed to create user';
    return new Response(msg, { status: 400, headers: corsHeaders });
  }

  const address = body.address ?? {};

  const { error: profileErr } = await adminClient.from('users').insert({
    id: created.user.id,
    email: body.email,
    name: body.name,
    phone: body.phone ?? null,
    birth_date: body.birthDate ? new Date(body.birthDate).toISOString() : null,
    street: address.street ?? null,
    postal_code: address.postalCode ?? null,
    city: address.city ?? null,
    country: address.country ?? null,
    place_of_education: body.studyPlace ?? null,
    profile_picture: body.profilePicture ?? null,
    study_program: body.study ?? null,
    seniority: body.seniority ?? 0,
    room_number: body.roomNumber ?? 0,
    on_leave: body.onLeave ?? false,
    is_active: body.isActive ?? true,
  });

  if (profileErr) {
    return new Response(profileErr.message, { status: 400, headers: corsHeaders });
  }

  return new Response(
    JSON.stringify({ user: created.user, initialPassword: password }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  );
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/create-user' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
