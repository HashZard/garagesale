export const SITE_CONFIG = {
  name: "GarageSale",
  fullName: "GarageSale.com.au",
  description: "Find garage sales near you across Australia.",
  defaultTitle:
    "Garage Sales Near You — Australia's Garage Sale Finder | GarageSale",
  navigation: [
    { href: "/", label: "Find sales" },
    { href: "/publish", label: "Publish your sale" },
  ],
} as const;

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}
