import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE_NAME = "garagesale_admin";
export const ADMIN_SESSION_SECONDS = 8 * 60 * 60;

export function secretsMatch(submitted: string, expected: string): boolean {
  const submittedDigest = createHmac("sha256", expected)
    .update(submitted)
    .digest();
  const expectedDigest = createHmac("sha256", expected)
    .update(expected)
    .digest();
  return timingSafeEqual(submittedDigest, expectedDigest);
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createAdminSessionToken(
  secret: string,
  now = Date.now(),
): string {
  const payload = Buffer.from(
    JSON.stringify({ expiresAt: now + ADMIN_SESSION_SECONDS * 1000 }),
  ).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

export function verifyAdminSessionToken(
  token: string | undefined,
  secret: string,
  now = Date.now(),
): boolean {
  if (!token) return false;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return false;
  const expected = sign(payload, secret);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    return false;
  }
  try {
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as { expiresAt?: unknown };
    return typeof decoded.expiresAt === "number" && decoded.expiresAt > now;
  } catch {
    return false;
  }
}
