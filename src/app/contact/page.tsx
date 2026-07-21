import Link from "next/link";

import { InfoPage } from "@/components/info-page";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get help with a GarageSale listing.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <InfoPage
      eyebrow="Contact"
      title="How can we help?"
      intro="The public support address will be activated with the production email domain before launch."
      sections={[
        {
          title: "Manage an existing listing",
          body: (
            <p>
              Use the private link from your confirmation email. If it is lost,
              request it again on the{" "}
              <Link href="/recover">management link recovery page</Link>.
            </p>
          ),
        },
        {
          title: "Report a listing",
          body: (
            <p>
              Reporting will be handled through the launch support address. If a
              listing creates an immediate safety concern, contact the
              appropriate local authority.
            </p>
          ),
        },
      ]}
    />
  );
}
