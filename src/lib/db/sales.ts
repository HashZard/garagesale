import "server-only";

import { addDays } from "date-fns";

import { DEFAULT_SEARCH_DAYS } from "@/config/constants";
import { createDemoSales } from "@/lib/db/demo-data";
import { getDemoSaleById, getPublishedDemoSales } from "@/lib/db/demo-store";
import { createPublicSupabaseClient } from "@/lib/db/supabase";
import { getServerEnv } from "@/lib/env";
import { calculateDistanceKm } from "@/lib/geo/distance";
import { matchesDateFilter } from "@/lib/geo/timezone";
import type { NearbySale, PublicSale, SaleSearchFilters } from "@/types/sale";

function applyDemoFilters(
  sales: PublicSale[],
  filters: SaleSearchFilters,
): NearbySale[] {
  const now = new Date();
  const windowEnd = addDays(now, DEFAULT_SEARCH_DAYS);
  const hasLocation =
    filters.latitude !== undefined && filters.longitude !== undefined;

  return sales
    .filter(
      (sale) =>
        new Date(sale.endAt) > now && new Date(sale.startAt) < windowEnd,
    )
    .filter((sale) => !filters.state || sale.state === filters.state)
    .filter(
      (sale) =>
        filters.categories.length === 0 ||
        filters.categories.some((category) =>
          sale.categories.includes(category),
        ),
    )
    .filter((sale) =>
      matchesDateFilter(sale.startAt, sale.state, filters.date, now),
    )
    .map((sale) => {
      const distanceKm = hasLocation
        ? calculateDistanceKm(
            { latitude: filters.latitude!, longitude: filters.longitude! },
            sale,
          )
        : null;
      return { ...sale, distanceKm };
    })
    .filter(
      (sale) => sale.distanceKm === null || sale.distanceKm <= filters.radiusKm,
    )
    .sort((first, second) => {
      const dateDifference =
        new Date(first.startAt).getTime() - new Date(second.startAt).getTime();
      if (dateDifference !== 0) return dateDifference;
      return (first.distanceKm ?? 0) - (second.distanceKm ?? 0);
    });
}

export async function getUpcomingSales(
  filters: SaleSearchFilters,
): Promise<NearbySale[]> {
  if (getServerEnv().APP_DATA_MODE === "demo") {
    return applyDemoFilters(
      [...createDemoSales(), ...getPublishedDemoSales()],
      filters,
    );
  }

  const client = createPublicSupabaseClient();
  if (filters.latitude !== undefined && filters.longitude !== undefined) {
    const { data, error } = await client.rpc("get_upcoming_sales_near", {
      category_filters: filters.categories,
      radius_km: filters.radiusKm,
      search_latitude: filters.latitude,
      search_longitude: filters.longitude,
      window_end: addDays(new Date(), DEFAULT_SEARCH_DAYS).toISOString(),
    });
    if (error) throw error;

    return data
      .map((sale) => ({
        address: sale.address,
        categories: sale.categories as PublicSale["categories"],
        createdAt: "",
        description: sale.description,
        distanceKm: sale.distance_km,
        endAt: sale.end_at,
        id: sale.id,
        latitude: sale.latitude,
        longitude: sale.longitude,
        photos: sale.photos,
        postcode: sale.postcode,
        source: sale.source as PublicSale["source"],
        sourceUrl: sale.source_url,
        startAt: sale.start_at,
        state: sale.state as PublicSale["state"],
        suburb: sale.suburb,
        title: sale.title,
        updatedAt: "",
      }))
      .filter((sale) =>
        matchesDateFilter(sale.startAt, sale.state, filters.date),
      );
  }

  let query = client
    .from("public_sales")
    .select("*")
    .order("start_at", { ascending: true })
    .limit(100);
  if (filters.state) query = query.eq("state", filters.state);
  const { data, error } = await query;
  if (error) throw error;

  return data
    .flatMap((sale) => {
      if (
        !sale.id ||
        !sale.title ||
        !sale.address ||
        !sale.suburb ||
        !sale.state ||
        !sale.postcode ||
        sale.longitude === null ||
        sale.latitude === null ||
        !sale.start_at ||
        !sale.end_at ||
        !sale.source
      ) {
        return [];
      }

      return [
        {
          address: sale.address,
          categories: (sale.categories ?? []) as PublicSale["categories"],
          createdAt: sale.created_at ?? "",
          description: sale.description,
          distanceKm: null,
          endAt: sale.end_at,
          id: sale.id,
          latitude: sale.latitude,
          longitude: sale.longitude,
          photos: sale.photos ?? [],
          postcode: sale.postcode,
          source: sale.source as PublicSale["source"],
          sourceUrl: sale.source_url,
          startAt: sale.start_at,
          state: sale.state as PublicSale["state"],
          suburb: sale.suburb,
          title: sale.title,
          updatedAt: sale.updated_at ?? "",
        },
      ];
    })
    .filter((sale) =>
      matchesDateFilter(sale.startAt, sale.state, filters.date),
    );
}

export async function getPublicSaleById(
  id: string,
): Promise<PublicSale | null> {
  if (getServerEnv().APP_DATA_MODE === "demo") {
    const seededSale = createDemoSales().find((sale) => sale.id === id);
    if (seededSale) return seededSale;

    const submittedSale = getDemoSaleById(id);
    return submittedSale?.status === "published" &&
      new Date(submittedSale.endAt) > new Date()
      ? submittedSale
      : null;
  }

  const client = createPublicSupabaseClient();
  const { data, error } = await client
    .from("public_sales")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (
    !data?.id ||
    !data.title ||
    !data.address ||
    !data.suburb ||
    !data.state ||
    !data.postcode ||
    data.longitude === null ||
    data.latitude === null ||
    !data.start_at ||
    !data.end_at ||
    !data.source
  ) {
    return null;
  }

  return {
    address: data.address,
    categories: (data.categories ?? []) as PublicSale["categories"],
    createdAt: data.created_at ?? "",
    description: data.description,
    endAt: data.end_at,
    id: data.id,
    latitude: data.latitude,
    longitude: data.longitude,
    photos: data.photos ?? [],
    postcode: data.postcode,
    source: data.source as PublicSale["source"],
    sourceUrl: data.source_url,
    startAt: data.start_at,
    state: data.state as PublicSale["state"],
    suburb: data.suburb,
    title: data.title,
    updatedAt: data.updated_at ?? "",
  };
}
