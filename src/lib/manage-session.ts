import "server-only";

import { cookies } from "next/headers";

export const MANAGE_SESSION_COOKIE = "garage-sale-manage-session";
export const MANAGE_SESSION_SECONDS = 60 * 60 * 24 * 30;

export async function getManageSessionToken(): Promise<string | null> {
  return (await cookies()).get(MANAGE_SESSION_COOKIE)?.value ?? null;
}

export async function clearManageSession(): Promise<void> {
  (await cookies()).set(MANAGE_SESSION_COOKIE, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
