import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

import type { NextConfig } from "next";

initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
        ],
      },
      {
        source: "/manage/:path*",
        headers: [
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "Cache-Control", value: "private, no-store" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        source: "/verify/:path*",
        headers: [
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "Cache-Control", value: "private, no-store" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "Cache-Control", value: "private, no-store" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

export default nextConfig;
