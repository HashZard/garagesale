import type { PublicSale, SaleStatus } from "@/types/sale";

export type ManagedSale = PublicSale & {
  contactEmail: string;
  manageToken: string;
  status: SaleStatus;
};
