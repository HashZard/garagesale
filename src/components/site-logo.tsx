import { MapPinned } from "lucide-react";
import Link from "next/link";

import { SITE_CONFIG } from "@/config/site";
import { cn } from "@/lib/utils";

type SiteLogoProps = {
  className?: string;
};

export function SiteLogo({ className }: SiteLogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "focus-visible:ring-ring inline-flex items-center gap-2 rounded-md font-semibold tracking-tight focus-visible:ring-2 focus-visible:outline-none",
        className,
      )}
      aria-label={`${SITE_CONFIG.name} home`}
    >
      <span className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-xl shadow-sm">
        <MapPinned className="size-5" aria-hidden="true" />
      </span>
      <span className="text-xl">{SITE_CONFIG.name}</span>
    </Link>
  );
}
