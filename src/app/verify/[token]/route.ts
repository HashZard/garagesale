import { NextResponse } from "next/server";

import { getSiteUrl } from "@/config/site";
import { resolveManageSaleId, verifySale } from "@/lib/db/mutations";
import {
  MANAGE_SESSION_COOKIE,
  MANAGE_SESSION_SECONDS,
} from "@/lib/manage-session";

type RouteContext = { params: Promise<{ token: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { token } = await context.params;
  const verifiedSaleId = await verifySale(token);
  if (!verifiedSaleId) {
    return NextResponse.redirect(new URL("/", getSiteUrl()));
  }

  const manageToken = new URL(request.url).searchParams.get("manage");
  if (manageToken) {
    const managedSaleId = await resolveManageSaleId(manageToken);
    if (managedSaleId === verifiedSaleId) {
      const response = NextResponse.redirect(
        new URL("/manage?verified=1", getSiteUrl()),
        { status: 303 },
      );
      response.cookies.set(MANAGE_SESSION_COOKIE, manageToken, {
        httpOnly: true,
        maxAge: MANAGE_SESSION_SECONDS,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      response.headers.set("Cache-Control", "private, no-store");
      return response;
    }
  }
  return NextResponse.redirect(new URL("/?verified=1", getSiteUrl()));
}
