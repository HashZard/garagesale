import { getSiteUrl } from "@/config/site";
import { createSaleCalendar } from "@/lib/calendar";
import { getPublicSaleById } from "@/lib/db/sales";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const sale = await getPublicSaleById(id);
  if (!sale) return new Response("Not found", { status: 404 });

  return new Response(createSaleCalendar(sale, getSiteUrl()), {
    headers: {
      "Content-Disposition": `attachment; filename="garage-sale-${sale.id}.ics"`,
      "Content-Type": "text/calendar; charset=utf-8",
    },
  });
}
