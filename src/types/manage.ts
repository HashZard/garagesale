import type { PublicSale, SaleStatus } from "@/types/sale";

export type ManagedSale = PublicSale & {
  contactEmail: string;
  status: SaleStatus;
};
