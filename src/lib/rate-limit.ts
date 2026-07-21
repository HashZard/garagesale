import "server-only";

import { createHash } from "node:crypto";

import { createServiceSupabaseClient } from "@/lib/db/supabase";
import { getServerEnv } from "@/lib/env";

declare global {
  var garageSaleRateLimits:
    Map<string, { count: number; expiresAt: number }> | undefined;
}

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

  if (getServerEnv().APP_DATA_MODE === "demo") {
    globalThis.garageSaleRateLimits ??= new Map();
    const store = globalThis.garageSaleRateLimits;
    const storeKey = `${input.action}:${keyHash}`;
    const current = store.get(storeKey);
    const now = Date.now();
    if (!current || current.expiresAt <= now) {
      store.set(storeKey, {
        count: 1,
        expiresAt: now + input.windowSeconds * 1000,
      });
      return true;
    }
    current.count += 1;
    return current.count <= input.maxRequests;
  }

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
