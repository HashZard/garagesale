import { NextResponse } from "next/server";
import { z } from "zod";

import { getSiteUrl } from "@/config/site";
import { resolveManageSaleId } from "@/lib/db/mutations";
import {
  MANAGE_SESSION_COOKIE,
  MANAGE_SESSION_SECONDS,
} from "@/lib/manage-session";

type RouteContext = { params: Promise<{ token: string }> };

const tokenSchema = z.string().min(32).max(64);

export async function GET(request: Request, context: RouteContext) {
  const { token } = await context.params;
  if (!tokenSchema.safeParse(token).success) {
    return NextResponse.redirect(new URL("/manage", getSiteUrl()));
  }
  const saleId = await resolveManageSaleId(token);
  if (!saleId) return NextResponse.redirect(new URL("/manage", getSiteUrl()));

  const sourceUrl = new URL(request.url);
  const destination = new URL("/manage", getSiteUrl());
  if (sourceUrl.searchParams.get("verified") === "1") {
    destination.searchParams.set("verified", "1");
  }
  const response = NextResponse.redirect(destination, { status: 303 });
  response.cookies.set(MANAGE_SESSION_COOKIE, token, {
    httpOnly: true,
    maxAge: MANAGE_SESSION_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
