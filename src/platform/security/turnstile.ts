import "server-only";

import { getServerEnv } from "@/lib/env";

export async function verifyTurnstile(
  token: string | undefined,
  remoteIp: string,
): Promise<boolean> {
  const environment = getServerEnv();
  if (!token) return false;
  const body = new FormData();
  body.set("secret", environment.TURNSTILE_SECRET_KEY);
  body.set("response", token);
  body.set("remoteip", remoteIp);
  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    { method: "POST", body },
  );
  if (!response.ok) return false;
  const result = (await response.json()) as { success?: boolean };
  return result.success === true;
}
