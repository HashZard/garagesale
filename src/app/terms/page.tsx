import { InfoPage } from "@/components/info-page";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms",
  description: "GarageSale MVP terms of use.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <InfoPage
      eyebrow="MVP terms draft"
      title="Terms of use"
      intro="These draft terms describe expected MVP behaviour and must receive a final legal review before public launch."
      sections={[
        {
          title: "Accurate and lawful listings",
          body: (
            <p>
              Publishers must have permission to advertise the location and
              images, provide accurate details, and only offer items that may be
              lawfully sold. Misleading, unsafe, unlawful or abusive content may
              be removed.
            </p>
          ),
        },
        {
          title: "Public address disclosure",
          body: (
            <p>
              By publishing, you understand that the submitted complete street
              address and exact map location will be visible publicly until the
              listing ends, is cancelled or is removed.
            </p>
          ),
        },
        {
          title: "Directory only",
          body: (
            <p>
              GarageSale helps people discover listings but is not a party to
              transactions between visitors and sellers. Visitors should use
              ordinary care when attending a location or purchasing an item.
            </p>
          ),
        },
      ]}
    />
  );
}
