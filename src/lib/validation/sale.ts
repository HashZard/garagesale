import { z } from "zod";

import {
  AUSTRALIAN_STATES,
  DATE_FILTERS,
  DEFAULT_RADIUS_KM,
  MAX_DESCRIPTION_LENGTH,
  MAX_PHOTO_COUNT,
  MAX_TITLE_LENGTH,
  RADIUS_OPTIONS_KM,
  SALE_CATEGORIES,
} from "@/config/constants";
import { localSaleTimeToDate } from "@/lib/geo/timezone";

const stateSchema = z.enum(AUSTRALIAN_STATES);
const categorySchema = z.enum(SALE_CATEGORIES.map(({ value }) => value));
const dateFilterSchema = z.enum(DATE_FILTERS.map(({ value }) => value));

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid date");
const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Choose a valid time");
const httpsUrlSchema = z
  .url()
  .refine(
    (value) => new URL(value).protocol === "https:",
    "Photo URLs must use HTTPS",
  );

const saleFields = {
  address: z.string().trim().min(5, "Choose a full street address"),
  categories: z.array(categorySchema).max(SALE_CATEGORIES.length).default([]),
  description: z.string().trim().max(MAX_DESCRIPTION_LENGTH).default(""),
  endTime: timeSchema,
  latitude: z.number().min(-44).max(-10),
  localDate: dateSchema,
  longitude: z.number().min(112).max(154),
  photos: z.array(httpsUrlSchema).max(MAX_PHOTO_COUNT).default([]),
  postcode: z.string().regex(/^\d{4}$/, "Enter a four digit postcode"),
  startTime: timeSchema,
  state: stateSchema,
  suburb: z.string().trim().min(2),
  title: z.string().trim().min(3).max(MAX_TITLE_LENGTH),
};

export function createPublishSaleSchema(now = () => new Date()) {
  return z
    .object({
      ...saleFields,
      contactEmail: z.string().trim().toLowerCase().email(),
      website: z.string().max(0).optional().default(""),
    })
    .superRefine((sale, context) => {
      const startAt = localSaleTimeToDate(
        sale.localDate,
        sale.startTime,
        sale.state,
      );
      const endAt = localSaleTimeToDate(
        sale.localDate,
        sale.endTime,
        sale.state,
      );

      if (startAt <= now()) {
        context.addIssue({
          code: "custom",
          message: "Start time must be in the future",
          path: ["startTime"],
        });
      }

      if (endAt <= startAt) {
        context.addIssue({
          code: "custom",
          message: "End time must be after start time on the same day",
          path: ["endTime"],
        });
      }
    });
}

export const publishSaleSchema = createPublishSaleSchema();
export const manageSaleSchema = z
  .object(saleFields)
  .superRefine((sale, context) => {
    const startAt = localSaleTimeToDate(
      sale.localDate,
      sale.startTime,
      sale.state,
    );
    const endAt = localSaleTimeToDate(sale.localDate, sale.endTime, sale.state);
    if (endAt <= startAt) {
      context.addIssue({
        code: "custom",
        message: "End time must be after start time on the same day",
        path: ["endTime"],
      });
    }
  });

export const saleSearchSchema = z.object({
  categories: z.array(categorySchema).default([]),
  date: dateFilterSchema.default("all"),
  latitude: z.coerce.number().min(-44).max(-10).optional(),
  longitude: z.coerce.number().min(112).max(154).optional(),
  radiusKm: z.coerce
    .number()
    .refine((value) => RADIUS_OPTIONS_KM.includes(value as 5 | 10 | 25 | 50))
    .default(DEFAULT_RADIUS_KM),
  suburbLabel: z.string().trim().max(100).optional(),
});

export const recoverLinkSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export type PublishSaleInput = z.infer<typeof publishSaleSchema>;
export type PublishSaleFormInput = z.input<typeof publishSaleSchema>;
export type ManageSaleInput = z.infer<typeof manageSaleSchema>;
export type ManageSaleFormInput = z.input<typeof manageSaleSchema>;
