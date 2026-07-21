import "server-only";

import {
  getActiveDemoSalesByEmail,
  getDemoSaleByToken,
} from "@/lib/db/demo-store";
import { createServiceSupabaseClient } from "@/lib/db/supabase";
import { getServerEnv } from "@/lib/env";
import type { ManagedSale } from "@/types/manage";
import type {
  AustralianState,
  SaleCategory,
  SaleSource,
  SaleStatus,
} from "@/types/sale";

type SaleRow = {
  address: string;
  categories: string[];
  contact_email: string | null;
  created_at: string;
  description: string | null;
  end_at: string;
  id: string;
  location: unknown;
  manage_token: string | null;
  photos: string[];
  postcode: string;
  source: string;
  source_url: string | null;
  start_at: string;
  state: string;
  status: string;
  suburb: string;
  title: string;
  updated_at: string;
};

function readCoordinates(location: unknown): [number, number] | null {
  if (!location || typeof location !== "object") return null;
  const coordinates = (location as { coordinates?: unknown }).coordinates;
  return Array.isArray(coordinates) &&
    typeof coordinates[0] === "number" &&
    typeof coordinates[1] === "number"
    ? [coordinates[0], coordinates[1]]
    : null;
}

function mapManagedSale(row: SaleRow): ManagedSale | null {
  const coordinates = readCoordinates(row.location);
  if (!row.contact_email || !row.manage_token || !coordinates) return null;
  return {
    address: row.address,
    categories: row.categories as SaleCategory[],
    contactEmail: row.contact_email,
    createdAt: row.created_at,
    description: row.description,
    endAt: row.end_at,
    id: row.id,
    latitude: coordinates[1],
    longitude: coordinates[0],
    manageToken: row.manage_token,
    photos: row.photos,
    postcode: row.postcode,
    source: row.source as SaleSource,
    sourceUrl: row.source_url,
    startAt: row.start_at,
    state: row.state as AustralianState,
    status: row.status as SaleStatus,
    suburb: row.suburb,
    title: row.title,
    updatedAt: row.updated_at,
  };
}

export async function getManagedSaleByToken(
  token: string,
): Promise<ManagedSale | null> {
  if (getServerEnv().APP_DATA_MODE === "demo") {
    const sale = getDemoSaleByToken(token);
    return sale?.status === "removed" ? null : sale;
  }

  const client = createServiceSupabaseClient();
  const { data, error } = await client
    .from("sales")
    .select("*")
    .eq("manage_token", token)
    .neq("status", "removed")
    .maybeSingle();
  if (error) throw error;
  return data ? mapManagedSale(data) : null;
}

export async function getActiveManagedSalesByEmail(
  email: string,
): Promise<ManagedSale[]> {
  if (getServerEnv().APP_DATA_MODE === "demo") {
    return getActiveDemoSalesByEmail(email);
  }

  const client = createServiceSupabaseClient();
  const { data, error } = await client
    .from("sales")
    .select("*")
    .ilike("contact_email", email)
    .in("status", ["pending_verification", "published"])
    .gt("end_at", new Date().toISOString());
  if (error) throw error;
  return data.flatMap((row) => {
    const sale = mapManagedSale(row);
    return sale ? [sale] : [];
  });
}
