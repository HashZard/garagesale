import { getSiteUrl, isSearchEngineIndexingEnabled } from "@/config/site";

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  if (!isSearchEngineIndexingEnabled()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/manage", "/recover", "/verify"],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
