import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/** Server-only Supabase client (service role, bypasses RLS). Never import from client components. */
export function getServiceSupabase(): SupabaseClient {
  const url = process.env['NEXT_PUBLIC_SUPABASE_URL'];
  const service = process.env['SUPABASE_SERVICE_ROLE_KEY'];
  if (!url || !service) throw new Error('Supabase is not configured on the server');
  const client = createClient(url, service, { auth: { persistSession: false } }) as SupabaseClient;
  return client;
}
