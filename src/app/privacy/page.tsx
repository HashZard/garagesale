import { InfoPage } from "@/components/info-page";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "GarageSale MVP privacy information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="MVP policy draft"
      title="Privacy"
      intro="This page describes the intended MVP data handling and must receive a final legal review before public launch."
      sections={[
        {
          title: "Information you provide",
          body: (
            <p>
              A listing includes its title, description, categories, images,
              date, time and complete street address. The complete address and
              exact map position are public. Your contact email and private
              management token are not public.
            </p>
          ),
        },
        {
          title: "How information is used",
          body: (
            <p>
              Listing details power public search and maps. Email is used to
              confirm a listing and recover its private management link.
              Technical request data may be used for abuse prevention and basic
              service analytics.
            </p>
          ),
        },
        {
          title: "Service providers and retention",
          body: (
            <p>
              The production service is intended to use hosting, database,
              mapping, email and analytics providers listed in the final policy.
              Retention periods and privacy contact details will be confirmed
              before launch.
            </p>
          ),
        },
      ]}
    />
  );
}
