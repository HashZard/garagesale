import { Container } from "@/components/container";
import { PublishForm } from "@/components/forms/publish-form";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Publish your garage sale free",
  description:
    "List your Australian garage sale for free in under three minutes.",
  alternates: { canonical: "/publish" },
};

export default function PublishPage() {
  return (
    <Container className="max-w-4xl py-8 sm:py-12">
      <div className="mb-8 max-w-2xl">
        <p className="text-primary text-sm font-medium">
          Free · No account needed
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Publish your garage sale
        </h1>
        <p className="text-muted-foreground mt-3">
          Add the essentials, confirm your email and your sale will appear for
          local buyers.
        </p>
      </div>
      <PublishForm />
    </Container>
  );
}
