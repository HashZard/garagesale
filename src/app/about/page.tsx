import Link from "next/link";

import { InfoPage } from "@/components/info-page";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About GarageSale",
  description: "Why GarageSale makes local weekend sales easier to discover.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <InfoPage
      eyebrow="About us"
      title="Making local garage sales easier to find"
      intro="GarageSale is a simple Australian directory for discovering nearby sales and publishing your own without creating an account."
      sections={[
        {
          title: "Built for the weekend",
          body: (
            <p>
              Search by suburb or postcode, compare listings on a map and save
              the details you need before heading out.
            </p>
          ),
        },
        {
          title: "Simple for sellers",
          body: (
            <p>
              Publishing is free. Confirm your email, then use one private link
              to edit, cancel or remove the listing.{" "}
              <Link href="/publish">Publish your sale</Link> when you&apos;re
              ready.
            </p>
          ),
        },
        {
          title: "An intentionally small first release",
          body: (
            <p>
              The MVP focuses on accurate details, full addresses and useful
              local search. More coverage will be added after the core service
              has been proven.
            </p>
          ),
        },
      ]}
    />
  );
}
