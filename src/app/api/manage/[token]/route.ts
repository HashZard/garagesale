import { z } from "zod";

import { MANAGE_RATE_LIMIT_PER_HOUR } from "@/config/constants";
import { setManagedSaleStatus, updateManagedSale } from "@/lib/db/mutations";
import {
  AddressVerificationError,
  verifyAustralianAddress,
} from "@/lib/geo/mapbox";
import { consumeRateLimit } from "@/lib/rate-limit";
import { manageSaleSchema } from "@/lib/validation/sale";

type RouteContext = { params: Promise<{ token: string }> };
const tokenSchema = z.uuid();

export async function PATCH(request: Request, context: RouteContext) {
  const { token } = await context.params;
  if (!tokenSchema.safeParse(token).success) {
    return Response.json({ error: "Listing not found" }, { status: 404 });
  }

  const allowed = await consumeRateLimit({
    action: "manage-update",
    key: token,
    maxRequests: MANAGE_RATE_LIMIT_PER_HOUR,
    windowSeconds: 3600,
  });
  if (!allowed) {
    return Response.json(
      { error: "Too many changes. Please try again later." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }
  const parsed = manageSaleSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Please check the form fields", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const verifiedInput = await verifyAustralianAddress(parsed.data);
    const updated = await updateManagedSale(token, verifiedInput);
    return updated
      ? Response.json({ ok: true })
      : Response.json({ error: "Listing not found" }, { status: 404 });
  } catch (error) {
    if (error instanceof AddressVerificationError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json(
      { error: "We couldn't save your changes. Please try again." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { token } = await context.params;
  if (!tokenSchema.safeParse(token).success) {
    return Response.json({ error: "Listing not found" }, { status: 404 });
  }
  try {
    const removed = await setManagedSaleStatus(token, "removed");
    return removed
      ? Response.json({ ok: true })
      : Response.json({ error: "Listing not found" }, { status: 404 });
  } catch {
    return Response.json(
      { error: "We couldn't remove this listing. Please try again." },
      { status: 500 },
    );
  }
}
