import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getServerEnv } from "@/lib/env";
import type { Database } from "@/types/database.generated";

export function createPublicSupabaseClient(): SupabaseClient<Database> {
  const environment = getServerEnv();
  const url = environment.SUPABASE_URL ?? environment.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || !environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    throw new Error("Supabase public client is not configured");
  }

  return createClient<Database>(
    url,
    environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    { auth: { persistSession: false } },
  );
}

export function createServiceSupabaseClient(): SupabaseClient<Database> {
  const environment = getServerEnv();
  const url = environment.SUPABASE_URL ?? environment.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || !environment.SUPABASE_SECRET_KEY) {
    throw new Error("Supabase service client is not configured");
  }

  return createClient<Database>(url, environment.SUPABASE_SECRET_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
