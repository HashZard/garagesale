import "server-only";

import { z } from "zod";

const serverEnvSchema = z
  .object({
    ADMIN_SECRET: z.string().min(32).optional(),
    DEPLOYMENT_ENV: z.enum(["local", "staging", "production"]).default("local"),
    EMAIL_DELIVERY_MODE: z.enum(["preview", "resend"]).default("preview"),
    MAPBOX_SERVER_TOKEN: z.string().optional(),
    NEXT_PUBLIC_MAPBOX_TOKEN: z.string().optional(),
    NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
    NEXT_PUBLIC_SUPABASE_URL: z.url().optional(),
    RESEND_API_KEY: z.string().optional(),
    RESEND_FROM_EMAIL: z.string().optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
    SUPABASE_URL: z.url().optional(),
    TURNSTILE_SECRET_KEY: z.string().optional(),
  })
  .superRefine((environment, context) => {
    if (environment.DEPLOYMENT_ENV !== "local") {
      for (const key of [
        "MAPBOX_SERVER_TOKEN",
        "NEXT_PUBLIC_MAPBOX_TOKEN",
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "SUPABASE_SERVICE_ROLE_KEY",
        "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
        "TURNSTILE_SECRET_KEY",
      ] as const) {
        if (!environment[key]) {
          context.addIssue({
            code: "custom",
            message: `${key} is required in supabase mode`,
            path: [key],
          });
        }
      }
    }

    if (
      environment.EMAIL_DELIVERY_MODE === "resend" &&
      (!environment.RESEND_API_KEY || !environment.RESEND_FROM_EMAIL)
    ) {
      context.addIssue({
        code: "custom",
        message:
          "RESEND_API_KEY and RESEND_FROM_EMAIL are required in resend mode",
        path: ["RESEND_API_KEY"],
      });
    }
  });

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cachedEnvironment: ServerEnv | undefined;

export function getServerEnv(): ServerEnv {
  cachedEnvironment ??= serverEnvSchema.parse(process.env);
  return cachedEnvironment;
}
