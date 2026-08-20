import "server-only";

import { localSaleTimeToDate } from "@/lib/geo/timezone";
import type { ManageSaleInput, PublishSaleInput } from "@/lib/validation/sale";
import { createServiceSupabaseClient } from "@/platform/database/supabase";

export type PublishResult = {
  id: string;
  manageToken: string;
  outboxId: string;
  verificationToken: string;
};

export async function publishSale(
  input: PublishSaleInput,
): Promise<PublishResult> {
  const startAt = localSaleTimeToDate(
    input.localDate,
    input.startTime,
    input.state,
  ).toISOString();
  const endAt = localSaleTimeToDate(
    input.localDate,
    input.endTime,
    input.state,
  ).toISOString();

  const { data, error } = await createServiceSupabaseClient().rpc(
    "create_self_sale",
    {
      p_address: input.address,
      p_categories: input.categories,
      p_contact_email: input.contactEmail,
      p_description: input.description,
      p_end_at: endAt,
      p_latitude: input.latitude,
      p_longitude: input.longitude,
      p_photos: input.photos,
      p_postcode: input.postcode,
      p_start_at: startAt,
      p_state: input.state,
      p_suburb: input.suburb,
      p_title: input.title,
    },
  );
  if (error) throw error;
  const [result] = data;
  if (!result) throw new Error("Sale creation returned no result");
  return {
    id: result.sale_id,
    manageToken: result.manage_token,
    outboxId: result.outbox_id,
    verificationToken: result.verification_token,
  };
}

export async function verifySale(token: string): Promise<string | null> {
  const { data, error } = await createServiceSupabaseClient().rpc(
    "verify_sale_token",
    { raw_token: token },
  );
  if (error) throw error;
  return data;
}

export async function resolveManageSaleId(
  token: string,
): Promise<string | null> {
  const { data, error } = await createServiceSupabaseClient().rpc(
    "resolve_manage_sale_id",
    { raw_token: token },
  );
  if (error) throw error;
  return data;
}

export async function updateManagedSale(
  manageToken: string,
  input: ManageSaleInput,
): Promise<boolean> {
  const saleId = await resolveManageSaleId(manageToken);
  if (!saleId) return false;
  const startAt = localSaleTimeToDate(
    input.localDate,
    input.startTime,
    input.state,
  ).toISOString();
  const endAt = localSaleTimeToDate(
    input.localDate,
    input.endTime,
    input.state,
  ).toISOString();
  const { data, error } = await createServiceSupabaseClient()
    .from("sales")
    .update({
      address: input.address,
      categories: input.categories,
      description: input.description || null,
      end_at: endAt,
      location: `POINT(${input.longitude} ${input.latitude})`,
      photos: input.photos,
      postcode: input.postcode,
      start_at: startAt,
      state: input.state,
      suburb: input.suburb,
      title: input.title,
    })
    .eq("id", saleId)
    .neq("status", "removed")
    .select("id")
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function setManagedSaleStatus(
  manageToken: string,
  status: "cancelled" | "removed",
): Promise<boolean> {
  const saleId = await resolveManageSaleId(manageToken);
  if (!saleId) return false;
  const { data, error } = await createServiceSupabaseClient()
    .from("sales")
    .update({ status })
    .eq("id", saleId)
    .neq("status", "removed")
    .select("id")
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function recordOutboxDelivery(
  outboxId: string,
  outcome: { error?: string },
): Promise<void> {
  const sent = !outcome.error;
  const { error } = await createServiceSupabaseClient()
    .from("email_outbox")
    .update({
      attempts: 1,
      last_error: outcome.error?.slice(0, 500) ?? null,
      next_attempt_at: sent
        ? new Date().toISOString()
        : new Date(Date.now() + 5 * 60_000).toISOString(),
      payload: sent ? {} : undefined,
      sent_at: sent ? new Date().toISOString() : null,
      status: sent ? "sent" : "failed",
    })
    .eq("id", outboxId);
  if (error) throw error;
}
