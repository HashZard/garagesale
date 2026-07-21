import "server-only";

import { DEMO_SUBURBS } from "@/lib/db/demo-data";
import {
  createPublicSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/db/supabase";
import { getServerEnv } from "@/lib/env";
import { calculateDistanceKm } from "@/lib/geo/distance";
import type { Suburb } from "@/types/sale";

function readCoordinates(location: unknown): [number, number] {
  if (location && typeof location === "object") {
    const coordinates = (location as { coordinates?: unknown }).coordinates;
    if (
      Array.isArray(coordinates) &&
      typeof coordinates[0] === "number" &&
      typeof coordinates[1] === "number"
    ) {
      return [coordinates[0], coordinates[1]];
    }
  }
  return [0, 0];
}

function mapSuburb(row: {
  id: number;
  location?: unknown;
  name: string;
  postcode: string;
  slug: string;
  state: string;
}): Suburb {
  const [longitude, latitude] = readCoordinates(row.location);
  return {
    id: row.id,
    latitude,
    longitude,
    name: row.name,
    postcode: row.postcode,
    slug: row.slug,
    state: row.state as Suburb["state"],
  };
}

export async function searchSuburbs(query: string): Promise<Suburb[]> {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [];

  if (getServerEnv().APP_DATA_MODE === "demo") {
    return DEMO_SUBURBS.filter(
      (suburb) =>
        suburb.name.toLowerCase().includes(normalizedQuery) ||
        suburb.postcode.startsWith(normalizedQuery),
    ).slice(0, 8);
  }

  const client = createPublicSupabaseClient();
  const numericQuery = /^\d+$/.test(normalizedQuery);
  const { data, error } = await client
    .from("suburbs")
    .select("id,name,state,postcode,slug,location")
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
  if (getServerEnv().APP_DATA_MODE === "demo") {
    return (
      DEMO_SUBURBS.find(
        (suburb) => suburb.slug === slug && (!state || suburb.state === state),
      ) ?? null
    );
  }

  const client = createPublicSupabaseClient();
  let query = client
    .from("suburbs")
    .select("id,name,state,postcode,slug,location")
    .eq("slug", slug);
  if (state) query = query.eq("state", state);
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  if (!data) return null;

  return mapSuburb(data);
}

export async function getSuburbsByState(
  state: Suburb["state"],
): Promise<Suburb[]> {
  if (getServerEnv().APP_DATA_MODE === "demo") {
    return DEMO_SUBURBS.filter((suburb) => suburb.state === state);
  }
  const client = createPublicSupabaseClient();
  const { data, error } = await client
    .from("suburbs")
    .select("id,name,state,postcode,slug,location")
    .eq("state", state)
    .order("name")
    .limit(5000);
  if (error) throw error;
  return data.map(mapSuburb);
}

export async function getNearbySuburbs(
  suburb: Suburb,
  limit = 6,
): Promise<Suburb[]> {
  const candidates = await getSuburbsByState(suburb.state);
  return candidates
    .filter((candidate) => candidate.id !== suburb.id)
    .map((candidate) => ({
      candidate,
      distance: calculateDistanceKm(suburb, candidate),
    }))
    .sort((first, second) => first.distance - second.distance)
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}

export async function getSitemapSuburbs(): Promise<Suburb[]> {
  if (getServerEnv().APP_DATA_MODE === "demo") return DEMO_SUBURBS;
  const client = createServiceSupabaseClient();
  const cutoff = new Date(Date.now() - 90 * 86_400_000).toISOString();
  const { data, error } = await client
    .from("sales")
    .select("suburb,state,postcode")
    .eq("status", "published")
    .gte("end_at", cutoff);
  if (error) throw error;
  const matches = await Promise.all(
    data.map(async (sale) => {
      const candidates = await searchSuburbs(sale.postcode ?? "");
      return candidates.find(
        (suburb) => suburb.name === sale.suburb && suburb.state === sale.state,
      );
    }),
  );
  return [
    ...new Map(
      matches.filter(Boolean).map((item) => [item!.id, item!]),
    ).values(),
  ];
}
