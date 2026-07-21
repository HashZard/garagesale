import "server-only";

import { createDemoSales } from "@/lib/db/demo-data";
import {
  getAllStoredDemoSales,
  getDemoAdminOverride,
  saveDemoAdminOverride,
} from "@/lib/db/demo-store";
import { createServiceSupabaseClient } from "@/lib/db/supabase";
import { getServerEnv } from "@/lib/env";
import { localSaleTimeToDate } from "@/lib/geo/timezone";
import type { ManageSaleInput } from "@/lib/validation/sale";
import type { AdminSale } from "@/types/admin";
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

function mapAdminSale(row: SaleRow): AdminSale | null {
  const coordinates = readCoordinates(row.location);
  if (!coordinates) return null;
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

function getDemoAdminSales(): AdminSale[] {
  const seeded = createDemoSales().map<AdminSale>((sale) => ({
    ...sale,
    contactEmail: sale.source === "self" ? "seller@example.test" : null,
    manageToken: sale.source === "self" ? sale.id : null,
    status: "published",
  }));
  const combined = [...seeded, ...getAllStoredDemoSales()];
  return [
    ...new Map(
      combined.map((sale) => [sale.id, getDemoAdminOverride(sale.id) ?? sale]),
    ).values(),
  ];
}

export async function getAdminSales(search = ""): Promise<AdminSale[]> {
  const normalized = search.trim().toLowerCase();
  if (getServerEnv().APP_DATA_MODE === "demo") {
    return getDemoAdminSales()
      .filter(
        (sale) =>
          !normalized ||
          sale.suburb.toLowerCase().includes(normalized) ||
          sale.contactEmail?.toLowerCase().includes(normalized) ||
          sale.source.toLowerCase().includes(normalized),
      )
      .sort((first, second) => second.createdAt.localeCompare(first.createdAt));
  }

  const client = createServiceSupabaseClient();
  let query = client
    .from("sales")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(250);
  if (normalized) {
    const safeSearch = normalized.replaceAll(/[,%()]/g, "");
    query = query.or(
      `suburb.ilike.%${safeSearch}%,contact_email.ilike.%${safeSearch}%,source.ilike.%${safeSearch}%`,
    );
  }
  const { data, error } = await query;
  if (error) throw error;
  return data.flatMap((row) => {
    const sale = mapAdminSale(row);
    return sale ? [sale] : [];
  });
}

export async function getAdminSaleById(id: string): Promise<AdminSale | null> {
  if (getServerEnv().APP_DATA_MODE === "demo") {
    return getDemoAdminSales().find((sale) => sale.id === id) ?? null;
  }
  const client = createServiceSupabaseClient();
  const { data, error } = await client
    .from("sales")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapAdminSale(data) : null;
}

export async function updateAdminSale(
  id: string,
  input: ManageSaleInput,
): Promise<boolean> {
  const existing = await getAdminSaleById(id);
  if (!existing) return false;
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
    saveDemoAdminOverride({
      ...existing,
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
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function removeAdminSale(id: string): Promise<boolean> {
  const existing = await getAdminSaleById(id);
  if (!existing) return false;
  if (getServerEnv().APP_DATA_MODE === "demo") {
    saveDemoAdminOverride({
      ...existing,
      status: "removed",
      updatedAt: new Date().toISOString(),
    });
    return true;
  }
  const client = createServiceSupabaseClient();
  const { data, error } = await client
    .from("sales")
    .update({ status: "removed" })
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}
