import type { PublicSale, SaleStatus } from "@/types/sale";

export type AdminSale = PublicSale & {
  contactEmail: string | null;
  manageToken: string | null;
  status: SaleStatus;
};
