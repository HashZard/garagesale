import { ArrowUpRight, CalendarDays, MapPin, Tag } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SALE_CATEGORIES } from "@/config/constants";
import { formatSaleDateTime } from "@/lib/geo/timezone";
import type { NearbySale } from "@/types/sale";

type SaleCardProps = {
  sale: NearbySale;
};

function getCategoryLabel(value: string): string {
  return (
    SALE_CATEGORIES.find((category) => category.value === value)?.label ?? value
  );
}

export function SaleCard({ sale }: SaleCardProps) {
  return (
    <Card className="group border-border/80 hover:border-primary/40 overflow-hidden py-0 transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <Link
        href={`/sale/${sale.id}`}
        className="focus-visible:ring-ring block focus-visible:ring-2 focus-visible:outline-none"
      >
        <div className="from-secondary via-muted to-accent/40 relative flex aspect-[16/7] items-center justify-center overflow-hidden bg-gradient-to-br">
          <Tag
            className="text-primary/35 size-10 transition-transform group-hover:scale-110 group-hover:rotate-6"
            aria-hidden="true"
          />
          <Badge className="bg-card/95 text-card-foreground absolute top-3 left-3 shadow-sm">
            {sale.source === "self" ? "Local listing" : `via ${sale.source}`}
          </Badge>
        </div>
        <CardContent className="space-y-3 p-4">
          <div>
            <h3 className="group-hover:text-primary line-clamp-2 text-base leading-snug font-semibold">
              {sale.title}
            </h3>
            <p className="text-primary mt-2 flex items-center gap-1.5 text-sm font-medium">
              <CalendarDays className="size-4" aria-hidden="true" />
              {formatSaleDateTime(sale.startAt, sale.endAt, sale.state)}
            </p>
          </div>
          <div className="text-muted-foreground flex items-start justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-1.5">
              <MapPin className="size-4 shrink-0" aria-hidden="true" />
              <span className="truncate">
                {sale.suburb}, {sale.state}
              </span>
            </span>
            {sale.distanceKm !== null ? (
              <span className="shrink-0">{sale.distanceKm.toFixed(1)} km</span>
            ) : null}
          </div>
          <div className="flex items-end justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {sale.categories.slice(0, 3).map((category) => (
                <Badge
                  key={category}
                  variant="secondary"
                  className="font-normal"
                >
                  {getCategoryLabel(category)}
                </Badge>
              ))}
            </div>
            <ArrowUpRight
              className="text-muted-foreground group-hover:text-primary size-4 shrink-0 transition-colors"
              aria-hidden="true"
            />
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
