import "server-only";

import { createHash } from "node:crypto";

import { createServiceSupabaseClient } from "@/lib/db/supabase";

type RateLimitInput = {
  action: string;
  key: string;
  maxRequests: number;
  windowSeconds: number;
};

export async function consumeRateLimit(
  input: RateLimitInput,
): Promise<boolean> {
  const keyHash = createHash("sha256").update(input.key).digest("hex");

  const { data, error } = await createServiceSupabaseClient().rpc(
    "consume_rate_limit",
    {
      limit_action: input.action,
      limit_key_hash: keyHash,
      max_requests: input.maxRequests,
      window_seconds: input.windowSeconds,
    },
  );
  if (error) throw error;
  return data;
}
