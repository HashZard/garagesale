import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getServerEnv } from "@/lib/env";
import type { Database } from "@/types/database.generated";

export function createPublicSupabaseClient(): SupabaseClient<Database> {
  const environment = getServerEnv();
  if (
    environment.APP_DATA_MODE !== "supabase" ||
    !environment.NEXT_PUBLIC_SUPABASE_URL ||
    !environment.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    throw new Error(
      "Supabase public client requested while APP_DATA_MODE is not supabase",
    );
  }

  return createClient<Database>(
    environment.NEXT_PUBLIC_SUPABASE_URL,
    environment.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } },
  );
}

export function createServiceSupabaseClient(): SupabaseClient<Database> {
  const environment = getServerEnv();
  if (
    environment.APP_DATA_MODE !== "supabase" ||
    !environment.NEXT_PUBLIC_SUPABASE_URL ||
    !environment.SUPABASE_SERVICE_ROLE_KEY
  ) {
    throw new Error(
      "Supabase service client requested while APP_DATA_MODE is not supabase",
    );
  }

  return createClient<Database>(
    environment.NEXT_PUBLIC_SUPABASE_URL,
    environment.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
