import { describe, expect, it } from "vitest";

import {
  createAdminSessionToken,
  secretsMatch,
  verifyAdminSessionToken,
} from "@/lib/admin-session";

describe("admin sessions", () => {
  const secret = "a-long-admin-secret-with-at-least-32-chars";

  it("accepts a valid signed token before expiry", () => {
    const token = createAdminSessionToken(secret, 1_000);
    expect(verifyAdminSessionToken(token, secret, 2_000)).toBe(true);
  });

  it("rejects tampered, expired and wrong-secret tokens", () => {
    const token = createAdminSessionToken(secret, 1_000);
    expect(verifyAdminSessionToken(`${token}x`, secret, 2_000)).toBe(false);
    expect(verifyAdminSessionToken(token, secret, 99_999_999)).toBe(false);
    expect(
      verifyAdminSessionToken(
        token,
        "another-long-admin-secret-with-32-characters",
        2_000,
      ),
    ).toBe(false);
  });

  it("compares submitted secrets safely", () => {
    expect(secretsMatch(secret, secret)).toBe(true);
    expect(secretsMatch("incorrect", secret)).toBe(false);
  });
});
