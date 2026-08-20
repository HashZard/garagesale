import { AUSTRALIAN_STATES } from "@/config/constants";
import { getSiteUrl } from "@/config/site";
import { getUpcomingSales } from "@/lib/db/sales";
import { getSitemapSuburbs } from "@/lib/db/suburbs";
import { statePath } from "@/lib/geo/state";

import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const [suburbs, sales] = await Promise.all([
    getSitemapSuburbs(),
    getUpcomingSales({ categories: [], date: "all", radiusKm: 25 }),
  ]);
  const staticPaths = ["", "/about", "/contact", "/privacy", "/terms"];
  const indexableStates = new Set(suburbs.map(({ state }) => state));
  return [
    ...staticPaths.map((path) => ({
      url: `${siteUrl}${path}`,
      changeFrequency: path === "" ? ("daily" as const) : ("monthly" as const),
      priority: path === "" ? 1 : 0.4,
    })),
    ...AUSTRALIAN_STATES.filter((state) => indexableStates.has(state)).map(
      (state) => ({
        url: `${siteUrl}${statePath(state)}`,
        changeFrequency: "daily" as const,
        priority: 0.7,
      }),
    ),
    ...suburbs.map((suburb) => ({
      url: `${siteUrl}${statePath(suburb.state)}/${suburb.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...sales.map((sale) => ({
      url: `${siteUrl}/sale/${sale.id}`,
      lastModified: sale.updatedAt || undefined,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
  ];
}
