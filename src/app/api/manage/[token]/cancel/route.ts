import { z } from "zod";

import { setManagedSaleStatus } from "@/lib/db/mutations";

type RouteContext = { params: Promise<{ token: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const { token } = await context.params;
  if (!z.uuid().safeParse(token).success) {
    return Response.json({ error: "Listing not found" }, { status: 404 });
  }
  try {
    const cancelled = await setManagedSaleStatus(token, "cancelled");
    return cancelled
      ? Response.json({ ok: true })
      : Response.json({ error: "Listing not found" }, { status: 404 });
  } catch {
    return Response.json(
      { error: "We couldn't cancel this listing. Please try again." },
      { status: 500 },
    );
  }
}
