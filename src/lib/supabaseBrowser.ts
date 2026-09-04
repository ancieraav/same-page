'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null = null;

/** Browser Supabase client (anon key) — realtime + public reads only. */
export function getBrowserSupabase(): SupabaseClient | null {
  if (cached) return cached;
  const url = process.env['NEXT_PUBLIC_SUPABASE_URL'];
  const anon = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
  if (!url || !anon) return null;
  cached = createClient(url, anon);
  return cached;
}
