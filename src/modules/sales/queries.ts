import "server-only";

import { addDays } from "date-fns";

import { DEFAULT_SEARCH_DAYS } from "@/config/constants";
import { matchesDateFilter } from "@/lib/geo/timezone";
import { mapNearbySaleRow, mapPublicSaleRow } from "@/modules/sales/mapper";
import { createPublicSupabaseClient } from "@/platform/database/supabase";
import type { NearbySale, PublicSale, SaleSearchFilters } from "@/types/sale";

export async function getUpcomingSales(
  filters: SaleSearchFilters,
): Promise<NearbySale[]> {
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
      .map(mapNearbySaleRow)
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
    .flatMap((row) => {
      const sale = mapPublicSaleRow(row);
      return sale ? [{ ...sale, distanceKm: null }] : [];
    })
    .filter((sale) =>
      matchesDateFilter(sale.startAt, sale.state, filters.date),
    );
}

export async function getPublicSaleById(
  id: string,
): Promise<PublicSale | null> {
  const { data, error } = await createPublicSupabaseClient()
    .from("public_sales")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapPublicSaleRow(data) : null;
}
