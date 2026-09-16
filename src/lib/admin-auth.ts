import "server-only";

import { cookies } from "next/headers";

import {
  ADMIN_COOKIE_NAME,
  verifyAdminSessionToken,
} from "@/lib/admin-session";
import { getServerEnv } from "@/lib/env";

export function getAdminSecret(): string {
  return getServerEnv().ADMIN_SECRET;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const secret = getAdminSecret();
  const cookieStore = await cookies();
  return verifyAdminSessionToken(
    cookieStore.get(ADMIN_COOKIE_NAME)?.value,
    secret,
  );
}
