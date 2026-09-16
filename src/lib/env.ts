import "server-only";

import { z } from "zod";

const serverEnvSchema = z.object({
  DEPLOYMENT_ENV: z.enum(["local", "production"]).optional(),
  ADMIN_SECRET: z.string().min(32),
  MAPBOX_SERVER_TOKEN: z.string().min(1),
  NEXT_PUBLIC_MAPBOX_TOKEN: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.url(),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.string().min(1),
  SUPABASE_SECRET_KEY: z.string().min(1),
  SUPABASE_URL: z.url(),
  TURNSTILE_SECRET_KEY: z.string().min(1),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cachedEnvironment: ServerEnv | undefined;

export function getServerEnv(): ServerEnv {
  cachedEnvironment ??= serverEnvSchema.parse(process.env);
  return cachedEnvironment;
}
