import { z } from "zod";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { removeAdminSale, updateAdminSale } from "@/lib/db/admin";
import {
  AddressVerificationError,
  verifyAustralianAddress,
} from "@/lib/geo/mapbox";
import { manageSaleSchema } from "@/lib/validation/sale";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "Unauthorised" }, { status: 401 });
  }
  const { id } = await context.params;
  if (!z.uuid().safeParse(id).success) {
    return Response.json({ error: "Listing not found" }, { status: 404 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = manageSaleSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Please check the form fields", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  try {
    const verified = await verifyAustralianAddress(parsed.data);
    const updated = await updateAdminSale(id, verified);
    return updated
      ? Response.json({ ok: true })
      : Response.json({ error: "Listing not found" }, { status: 404 });
  } catch (error) {
    if (error instanceof AddressVerificationError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json({ error: "Could not save changes" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "Unauthorised" }, { status: 401 });
  }
  const { id } = await context.params;
  if (!z.uuid().safeParse(id).success) {
    return Response.json({ error: "Listing not found" }, { status: 404 });
  }
  try {
    const removed = await removeAdminSale(id);
    return removed
      ? Response.json({ ok: true })
      : Response.json({ error: "Listing not found" }, { status: 404 });
  } catch {
    return Response.json(
      { error: "Could not remove listing" },
      { status: 500 },
    );
  }
}
