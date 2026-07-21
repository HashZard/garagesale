import "server-only";

import { getDemoSaleByToken, saveDemoSale } from "@/lib/db/demo-store";
import { createServiceSupabaseClient } from "@/lib/db/supabase";
import { getServerEnv } from "@/lib/env";
import { localSaleTimeToDate } from "@/lib/geo/timezone";
import type { ManageSaleInput, PublishSaleInput } from "@/lib/validation/sale";
import type { ManagedSale } from "@/types/manage";

type PublishResult = {
  id: string;
  manageToken: string;
};

export async function publishSale(
  input: PublishSaleInput,
): Promise<PublishResult> {
  const id = crypto.randomUUID();
  const manageToken = crypto.randomUUID();
  const now = new Date().toISOString();
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

  if (getServerEnv().APP_DATA_MODE === "demo") {
    const sale: ManagedSale = {
      address: input.address,
      categories: input.categories,
      contactEmail: input.contactEmail,
      createdAt: now,
      description: input.description || null,
      endAt,
      id,
      latitude: input.latitude,
      longitude: input.longitude,
      manageToken,
      photos: input.photos,
      postcode: input.postcode,
      source: "self",
      sourceUrl: null,
      startAt,
      state: input.state,
      status: "pending_verification",
      suburb: input.suburb,
      title: input.title,
      updatedAt: now,
    };
    saveDemoSale(sale);
    return { id, manageToken };
  }

  const client = createServiceSupabaseClient();
  const { error } = await client.from("sales").insert({
    address: input.address,
    categories: input.categories,
    contact_email: input.contactEmail,
    description: input.description || null,
    end_at: endAt,
    id,
    location: `POINT(${input.longitude} ${input.latitude})`,
    manage_token: manageToken,
    photos: input.photos,
    postcode: input.postcode,
    source: "self",
    start_at: startAt,
    state: input.state,
    status: "pending_verification",
    suburb: input.suburb,
    title: input.title,
  });
  if (error) throw error;

  return { id, manageToken };
}

export async function verifySale(manageToken: string): Promise<boolean> {
  if (getServerEnv().APP_DATA_MODE === "demo") {
    const sale = getDemoSaleByToken(manageToken);
    if (!sale) return false;
    if (sale.status === "published") return true;
    if (sale.status !== "pending_verification") return false;
    saveDemoSale({
      ...sale,
      status: "published",
      updatedAt: new Date().toISOString(),
    });
    return true;
  }

  const client = createServiceSupabaseClient();
  const { data, error } = await client
    .from("sales")
    .select("status")
    .eq("manage_token", manageToken)
    .maybeSingle();
  if (error || !data) return false;
  if (data.status === "published") return true;
  if (data.status !== "pending_verification") return false;

  const { error: updateError } = await client
    .from("sales")
    .update({
      email_verified_at: new Date().toISOString(),
      status: "published",
    })
    .eq("manage_token", manageToken)
    .eq("status", "pending_verification");
  return !updateError;
}

export async function updateManagedSale(
  manageToken: string,
  input: ManageSaleInput,
): Promise<boolean> {
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

  if (getServerEnv().APP_DATA_MODE === "demo") {
    const sale = getDemoSaleByToken(manageToken);
    if (!sale || sale.status === "removed") return false;
    saveDemoSale({
      ...sale,
      address: input.address,
      categories: input.categories,
      description: input.description || null,
      endAt,
      latitude: input.latitude,
      longitude: input.longitude,
      photos: input.photos,
      postcode: input.postcode,
      startAt,
      state: input.state,
      suburb: input.suburb,
      title: input.title,
      updatedAt: new Date().toISOString(),
    });
    return true;
  }

  const client = createServiceSupabaseClient();
  const { data, error } = await client
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
    .eq("manage_token", manageToken)
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
  if (getServerEnv().APP_DATA_MODE === "demo") {
    const sale = getDemoSaleByToken(manageToken);
    if (!sale || sale.status === "removed") return false;
    saveDemoSale({
      ...sale,
      status,
      updatedAt: new Date().toISOString(),
    });
    return true;
  }

  const client = createServiceSupabaseClient();
  const { data, error } = await client
    .from("sales")
    .update({ status })
    .eq("manage_token", manageToken)
    .neq("status", "removed")
    .select("id")
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}
