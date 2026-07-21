import type {
  ManageSaleFormInput,
  ManageSaleInput,
} from "@/lib/validation/sale";

import type { UseFormReturn } from "react-hook-form";

export type ManageFormApi = UseFormReturn<
  ManageSaleFormInput,
  unknown,
  ManageSaleInput
>;
