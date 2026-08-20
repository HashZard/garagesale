import "server-only";

import { localSaleTimeToDate } from "@/lib/geo/timezone";
import type { ManageSaleInput } from "@/lib/validation/sale";
import { mapAdminSale } from "@/modules/sales/mapper";
import { createServiceSupabaseClient } from "@/platform/database/supabase";
import type { AdminSale } from "@/types/admin";

export async function getAdminSales(search = ""): Promise<AdminSale[]> {
  const client = createServiceSupabaseClient();
  const { data: sales, error } = await client
    .from("sales")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(250);
  if (error) throw error;
  if (sales.length === 0) return [];

  const { data: privateRows, error: privateError } = await client
    .from("sale_private_details")
    .select("sale_id,contact_email")
    .in(
      "sale_id",
      sales.map(({ id }) => id),
    );
  if (privateError) throw privateError;
  const emails = new Map(
    privateRows.map((row) => [row.sale_id, row.contact_email]),
  );
  const normalized = search.trim().toLowerCase();
  return sales
    .flatMap((row) => {
      const sale = mapAdminSale(row, emails.get(row.id) ?? null);
      return sale ? [sale] : [];
    })
    .filter(
      (sale) =>
        !normalized ||
        sale.suburb.toLowerCase().includes(normalized) ||
        sale.contactEmail?.includes(normalized) ||
        sale.source.toLowerCase().includes(normalized),
    );
}

export async function getAdminSaleById(id: string): Promise<AdminSale | null> {
  const client = createServiceSupabaseClient();
  const [saleResult, privateResult] = await Promise.all([
    client.from("sales").select("*").eq("id", id).maybeSingle(),
    client
      .from("sale_private_details")
      .select("contact_email")
      .eq("sale_id", id)
      .maybeSingle(),
  ]);
  if (saleResult.error) throw saleResult.error;
  if (privateResult.error) throw privateResult.error;
  return saleResult.data
    ? mapAdminSale(saleResult.data, privateResult.data?.contact_email ?? null)
    : null;
}

export async function updateAdminSale(
  id: string,
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
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function removeAdminSale(id: string): Promise<boolean> {
  const { data, error } = await createServiceSupabaseClient()
    .from("sales")
    .update({ status: "removed" })
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}
