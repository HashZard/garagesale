import {
  MAX_PHOTO_BYTES,
  UPLOAD_RATE_LIMIT_PER_HOUR,
} from "@/config/constants";
import { createServiceSupabaseClient } from "@/lib/db/supabase";
import { getServerEnv } from "@/lib/env";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getRequestIp } from "@/lib/request";

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  if (getServerEnv().APP_DATA_MODE !== "supabase") {
    return Response.json(
      { error: "Uploads require Supabase mode" },
      { status: 503 },
    );
  }

  const allowed = await consumeRateLimit({
    action: "photo-upload",
    key: getRequestIp(request),
    maxRequests: UPLOAD_RATE_LIMIT_PER_HOUR,
    windowSeconds: 3600,
  });
  if (!allowed) {
    return Response.json(
      { error: "Too many photo uploads. Please try again later." },
      { status: 429 },
    );
  }

  let body: {
    contentType?: unknown;
    fileSize?: unknown;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: "Invalid image" }, { status: 400 });
  }
  if (
    typeof body.contentType !== "string" ||
    !ALLOWED_IMAGE_TYPES.has(body.contentType) ||
    typeof body.fileSize !== "number" ||
    body.fileSize <= 0 ||
    body.fileSize > MAX_PHOTO_BYTES
  ) {
    return Response.json({ error: "Invalid image" }, { status: 400 });
  }

  const extension =
    body.contentType === "image/png"
      ? "png"
      : body.contentType === "image/webp"
        ? "webp"
        : "jpg";
  const path = `${crypto.randomUUID()}/${crypto.randomUUID()}.${extension}`;
  const client = createServiceSupabaseClient();
  const { data, error } = await client.storage
    .from("sale-photos")
    .createSignedUploadUrl(path);
  if (error) {
    return Response.json(
      { error: "Could not prepare upload" },
      { status: 500 },
    );
  }

  const { data: publicUrl } = client.storage
    .from("sale-photos")
    .getPublicUrl(path);
  return Response.json({
    path,
    token: data.token,
    publicUrl: publicUrl.publicUrl,
  });
}
