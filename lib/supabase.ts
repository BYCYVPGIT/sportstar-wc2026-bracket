import { createClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client.
 * Uses the service role key — bypasses RLS.
 * NEVER import this in client components or expose to the browser.
 */
export function createServerClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

/**
 * Browser-safe Supabase client.
 * Uses the anon key — subject to Row Level Security.
 * Safe to import in client components.
 */
export function createBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
