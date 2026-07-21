"use client";

import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";

type ErrorPageProps = {
  reset: () => void;
};

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <Container className="py-16">
      <div className="bg-card flex min-h-64 flex-col items-center justify-center rounded-2xl border p-8 text-center">
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Please try again. Your search has not been changed.
        </p>
        <Button className="mt-5" onClick={reset} size="lg">
          Try again
        </Button>
      </div>
    </Container>
  );
}
