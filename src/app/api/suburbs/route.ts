import { searchSuburbs } from "@/lib/db/suburbs";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.slice(0, 100) ?? "";
  const suburbs = query.length >= 2 ? await searchSuburbs(query) : [];
  return Response.json({ suburbs });
}
