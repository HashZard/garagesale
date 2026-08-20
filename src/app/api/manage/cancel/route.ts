import { setManagedSaleStatus } from "@/lib/db/mutations";
import { getManageSessionToken } from "@/lib/manage-session";

export async function POST() {
  const token = await getManageSessionToken();
  if (!token)
    return Response.json({ error: "Listing not found" }, { status: 404 });
  try {
    const cancelled = await setManagedSaleStatus(token, "cancelled");
    return cancelled
      ? Response.json({ ok: true })
      : Response.json({ error: "Listing not found" }, { status: 404 });
  } catch {
    return Response.json(
      { error: "We couldn't cancel this listing. Please try again." },
      { status: 500 },
    );
  }
}
