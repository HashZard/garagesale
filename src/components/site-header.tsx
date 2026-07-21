import { Plus } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/container";
import { SiteLogo } from "@/components/site-logo";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/85 sticky top-0 z-50 border-b backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <SiteLogo />
        <nav className="flex items-center gap-1" aria-label="Main navigation">
          <Button
            variant="ghost"
            size="lg"
            asChild
            className="hidden sm:inline-flex"
          >
            <Link href="/">Find sales</Link>
          </Button>
          <Button size="lg" asChild>
            <Link href="/publish" prefetch={false}>
              <Plus aria-hidden="true" />
              <span className="hidden sm:inline">Publish your sale</span>
              <span className="sm:hidden">Publish</span>
            </Link>
          </Button>
        </nav>
      </Container>
    </header>
  );
}
