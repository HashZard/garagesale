import { cookies } from "next/headers";

import { ADMIN_LOGIN_RATE_LIMIT_PER_HOUR } from "@/config/constants";
import { getAdminSecret } from "@/lib/admin-auth";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_SECONDS,
  createAdminSessionToken,
  secretsMatch,
} from "@/lib/admin-session";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getRequestIp } from "@/lib/request";

export async function POST(request: Request) {
  const allowed = await consumeRateLimit({
    action: "admin-login",
    key: getRequestIp(request),
    maxRequests: ADMIN_LOGIN_RATE_LIMIT_PER_HOUR,
    windowSeconds: 3600,
  });
  if (!allowed) {
    return Response.json(
      { error: "Too many sign-in attempts. Try again later." },
      { status: 429 },
    );
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  const submitted =
    body && typeof body === "object" && "secret" in body
      ? (body as { secret?: unknown }).secret
      : null;
  const expected = getAdminSecret();
  if (
    typeof submitted !== "string" ||
    !expected ||
    !secretsMatch(submitted, expected)
  ) {
    return Response.json({ error: "Invalid admin secret" }, { status: 401 });
  }
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, createAdminSessionToken(expected), {
    httpOnly: true,
    maxAge: ADMIN_SESSION_SECONDS,
    path: "/",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
  return Response.json({ ok: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
  return Response.json({ ok: true });
}
