import { Container } from "@/components/container";
import { RecoverForm } from "@/components/forms/recover-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recover your management link",
  description: "Request private links for your active garage sale listings.",
  robots: { index: false, follow: false },
};

export default function RecoverPage() {
  return (
    <Container className="max-w-xl py-12 sm:py-20">
      <Card>
        <CardHeader>
          <p className="text-primary text-sm font-medium">No account needed</p>
          <CardTitle className="text-2xl">Recover your private link</CardTitle>
          <p className="text-muted-foreground text-sm">
            Enter the email used when publishing. We&apos;ll send links for any
            active listings that match.
          </p>
        </CardHeader>
        <CardContent>
          <RecoverForm />
        </CardContent>
      </Card>
    </Container>
  );
}
