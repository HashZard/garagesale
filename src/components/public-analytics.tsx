"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";

const PRIVATE_PATH_PREFIXES = ["/admin", "/manage", "/recover", "/verify"];

export function PublicAnalytics() {
  const pathname = usePathname();
  const token = process.env.NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN;
  if (
    !token ||
    PRIVATE_PATH_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  ) {
    return null;
  }

  return (
    <Script
      id="cloudflare-web-analytics"
      src="https://static.cloudflareinsights.com/beacon.min.js"
      strategy="afterInteractive"
      data-cf-beacon={JSON.stringify({ token })}
    />
  );
}
