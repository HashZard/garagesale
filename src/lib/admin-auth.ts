import "server-only";

import { cookies } from "next/headers";

import {
  ADMIN_COOKIE_NAME,
  verifyAdminSessionToken,
} from "@/lib/admin-session";
import { getServerEnv } from "@/lib/env";

export const DEMO_ADMIN_SECRET = "garage-sale-local-admin-secret-change-me";

export function getAdminSecret(): string | null {
  const environment = getServerEnv();
  return (
    environment.ADMIN_SECRET ??
    (environment.APP_DATA_MODE === "demo" &&
    process.env.NODE_ENV !== "production"
      ? DEMO_ADMIN_SECRET
      : null)
  );
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const secret = getAdminSecret();
  if (!secret) return false;
  const cookieStore = await cookies();
  return verifyAdminSessionToken(
    cookieStore.get(ADMIN_COOKIE_NAME)?.value,
    secret,
  );
}
