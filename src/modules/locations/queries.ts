import "server-only";

import {
  createPublicSupabaseClient,
  createServiceSupabaseClient,
} from "@/platform/database/supabase";
import type { Suburb } from "@/types/sale";

function mapSuburb(row: {
  id: number | null;
  latitude: number | null;
  longitude: number | null;
  name: string | null;
  postcode: string | null;
  slug: string | null;
  state: string | null;
}): Suburb {
  if (
    row.id === null ||
    row.latitude === null ||
    row.longitude === null ||
    !row.name ||
    !row.postcode ||
    !row.slug ||
    !row.state
  ) {
    throw new Error(`Suburb ${row.slug} has no coordinates`);
  }
  return {
    id: row.id,
    latitude: row.latitude,
    longitude: row.longitude,
    name: row.name,
    postcode: row.postcode,
    slug: row.slug,
    state: row.state as Suburb["state"],
  };
}

export async function searchSuburbs(query: string): Promise<Suburb[]> {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [];
  const numericQuery = /^\d+$/.test(normalizedQuery);
  const { data, error } = await createPublicSupabaseClient()
    .from("suburb_directory")
    .select("id,name,state,postcode,slug,latitude,longitude")
    .or(
      numericQuery
        ? `postcode.ilike.${normalizedQuery}%`
        : `name.ilike.%${normalizedQuery}%`,
    )
    .limit(8);
  if (error) throw error;
  return data.map(mapSuburb);
}

export async function getSuburbBySlug(
  slug: string,
  state?: Suburb["state"],
): Promise<Suburb | null> {
  let query = createPublicSupabaseClient()
    .from("suburb_directory")
    .select("id,name,state,postcode,slug,latitude,longitude")
    .eq("slug", slug);
  if (state) query = query.eq("state", state);
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data ? mapSuburb(data) : null;
}

export async function getSuburbsByState(
  state: Suburb["state"],
): Promise<Suburb[]> {
  const { data, error } = await createPublicSupabaseClient().rpc(
    "get_indexable_suburbs",
    { state_filter: state },
  );
  if (error) throw error;
  return data.map((row) => ({
    id: row.id,
    latitude: row.latitude,
    longitude: row.longitude,
    name: row.name,
    postcode: row.postcode,
    slug: row.slug,
    state: row.state as Suburb["state"],
  }));
}

export async function getNearbySuburbs(
  suburb: Suburb,
  limit = 6,
): Promise<Suburb[]> {
  const { data, error } = await createPublicSupabaseClient().rpc(
    "get_nearby_suburbs",
    { origin_suburb_id: suburb.id, result_limit: limit },
  );
  if (error) throw error;
  return data.map((row) => ({
    id: row.id,
    latitude: row.latitude,
    longitude: row.longitude,
    name: row.name,
    postcode: row.postcode,
    slug: row.slug,
    state: row.state as Suburb["state"],
  }));
}

export async function getSitemapSuburbs(): Promise<Suburb[]> {
  const { data, error } = await createServiceSupabaseClient().rpc(
    "get_indexable_suburbs",
    {},
  );
  if (error) throw error;
  return data.map((row) => ({
    id: row.id,
    latitude: row.latitude,
    longitude: row.longitude,
    name: row.name,
    postcode: row.postcode,
    slug: row.slug,
    state: row.state as Suburb["state"],
  }));
}
