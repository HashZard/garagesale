import "server-only";

import { resolveManageSaleId } from "@/modules/sales/commands";
import { mapManagedSale } from "@/modules/sales/mapper";
import { createServiceSupabaseClient } from "@/platform/database/supabase";
import type { ManagedSale } from "@/types/manage";

export type RecoverySale = {
  manageToken: string;
  outboxId: string;
  status: "pending_verification" | "published";
  title: string;
  verificationToken: string | null;
};

export async function getManagedSaleByToken(
  token: string,
): Promise<ManagedSale | null> {
  const saleId = await resolveManageSaleId(token);
  if (!saleId) return null;
  const client = createServiceSupabaseClient();
  const [saleResult, privateResult] = await Promise.all([
    client.from("sales").select("*").eq("id", saleId).maybeSingle(),
    client
      .from("sale_private_details")
      .select("contact_email")
      .eq("sale_id", saleId)
      .maybeSingle(),
  ]);
  if (saleResult.error) throw saleResult.error;
  if (privateResult.error) throw privateResult.error;
  if (!saleResult.data) throw new Error("Managed sale record is missing");
  if (!privateResult.data) {
    throw new Error("Managed sale private record is missing");
  }
  const sale = mapManagedSale(
    saleResult.data,
    privateResult.data.contact_email,
  );
  if (!sale) throw new Error("Managed sale location could not be decoded");
  return sale;
}

export async function issueRecoveryTokens(
  email: string,
): Promise<RecoverySale[]> {
  const { data, error } = await createServiceSupabaseClient().rpc(
    "issue_sale_recovery_tokens",
    { p_contact_email: email },
  );
  if (error) throw error;
  return data.map((sale) => ({
    manageToken: sale.manage_token,
    outboxId: sale.outbox_id,
    status: sale.sale_status as RecoverySale["status"],
    title: sale.sale_title,
    verificationToken: sale.verification_token || null,
  }));
}
