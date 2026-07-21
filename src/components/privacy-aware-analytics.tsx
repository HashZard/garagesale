"use client";

import { Analytics } from "@vercel/analytics/next";

const PRIVATE_PATH_PREFIXES = ["/admin", "/manage", "/recover", "/verify"];

export function PrivacyAwareAnalytics() {
  return (
    <Analytics
      beforeSend={(event) => {
        const pathname = new URL(event.url).pathname;
        return PRIVATE_PATH_PREFIXES.some((prefix) =>
          pathname.startsWith(prefix),
        )
          ? null
          : event;
      }}
    />
  );
}
