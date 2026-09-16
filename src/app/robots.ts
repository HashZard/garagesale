import { getSiteUrl } from "@/config/site";

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/manage", "/recover", "/verify"],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
