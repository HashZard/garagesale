import { getCloudflareContext } from "@opennextjs/cloudflare";

import {
  MAX_PHOTO_BYTES,
  UPLOAD_RATE_LIMIT_PER_HOUR,
} from "@/config/constants";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getRequestIp } from "@/lib/request";

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function detectImageType(bytes: Uint8Array): string | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
    return "image/jpeg";
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  )
    return "image/png";
  if (
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  )
    return "image/webp";
  return null;
}

export async function POST(request: Request) {
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

  const claimedType = request.headers.get("content-type")?.split(";")[0];
  if (!claimedType || !ALLOWED_IMAGE_TYPES.has(claimedType)) {
    return Response.json({ error: "Invalid image" }, { status: 400 });
  }
  const body = await request.arrayBuffer();
  if (body.byteLength === 0 || body.byteLength > MAX_PHOTO_BYTES) {
    return Response.json({ error: "Invalid image size" }, { status: 400 });
  }
  const actualType = detectImageType(new Uint8Array(body));
  if (!actualType || actualType !== claimedType) {
    return Response.json(
      { error: "Image content does not match its type" },
      { status: 400 },
    );
  }

  const extension =
    actualType === "image/png"
      ? "png"
      : actualType === "image/webp"
        ? "webp"
        : "jpg";
  const now = new Date();
  const key = `uploads/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${crypto.randomUUID()}.${extension}`;
  const originalName = request.headers.get("x-file-name")?.slice(0, 180);
  const { env } = await getCloudflareContext({ async: true });
  await env.SALE_PHOTOS.put(key, body, {
    customMetadata: originalName ? { originalName } : undefined,
    httpMetadata: { contentType: actualType },
  });
  return Response.json({ key, publicUrl: `/media/${key}` });
}
