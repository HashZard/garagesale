import type {
  PublishSaleFormInput,
  PublishSaleInput,
} from "@/lib/validation/sale";

import type { UseFormReturn } from "react-hook-form";

export type PublishFormApi = UseFormReturn<
  PublishSaleFormInput,
  unknown,
  PublishSaleInput
>;

export type MapboxFeature = {
  properties?: {
    context?: {
      place?: { name?: string };
      postcode?: { name?: string };
      region?: { region_code?: string };
    };
    coordinates?: { latitude?: number; longitude?: number };
    full_address?: string;
    name?: string;
  };
};

export function tomorrowDate(): string {
  const tomorrow = new Date(Date.now() + 86_400_000);
  return tomorrow.toISOString().slice(0, 10);
}
