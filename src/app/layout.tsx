import { Geist } from "next/font/google";

import { PublicAnalytics } from "@/components/public-analytics";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  getSiteUrl,
  isSearchEngineIndexingEnabled,
  SITE_CONFIG,
} from "@/config/site";

import type { Metadata } from "next";

import "./globals.css";

const geistSans = Geist({
  display: "optional",
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: SITE_CONFIG.defaultTitle,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  applicationName: SITE_CONFIG.name,
  openGraph: {
    type: "website",
    siteName: SITE_CONFIG.name,
    title: SITE_CONFIG.defaultTitle,
    description: SITE_CONFIG.description,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.defaultTitle,
    description: SITE_CONFIG.description,
  },
  robots: isSearchEngineIndexingEnabled()
    ? undefined
    : { index: false, follow: false, noarchive: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-AU" className={geistSans.variable}>
      <body className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <PublicAnalytics />
      </body>
    </html>
  );
}
