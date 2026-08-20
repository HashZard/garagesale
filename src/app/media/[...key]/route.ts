import { getCloudflareContext } from "@opennextjs/cloudflare";
import { notFound } from "next/navigation";

type RouteContext = { params: Promise<{ key: string[] }> };

export async function GET(request: Request, context: RouteContext) {
  const { key: segments } = await context.params;
  if (
    segments.length === 0 ||
    segments.some((segment) => !/^[a-zA-Z0-9._-]+$/.test(segment))
  ) {
    notFound();
  }
  const key = segments.join("/");
  const { env } = await getCloudflareContext({ async: true });
  const object = await env.SALE_PHOTOS.get(key, {
    onlyIf: request.headers,
  });
  if (!object) notFound();
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  headers.set("etag", object.httpEtag);
  headers.set("x-content-type-options", "nosniff");
  return new Response(object.body, { headers });
}
