import { MapPin } from "lucide-react";
import Link from "next/link";

import type { NearbySale } from "@/types/sale";

type FallbackMapProps = {
  sales: NearbySale[];
};

export function FallbackMap({ sales }: FallbackMapProps) {
  const latitudes = sales.map((sale) => sale.latitude);
  const longitudes = sales.map((sale) => sale.longitude);
  const minimumLatitude = Math.min(...latitudes, -32.1);
  const maximumLatitude = Math.max(...latitudes, -32.0);
  const minimumLongitude = Math.min(...longitudes, 115.72);
  const maximumLongitude = Math.max(...longitudes, 115.81);
  const latitudeRange = Math.max(maximumLatitude - minimumLatitude, 0.01);
  const longitudeRange = Math.max(maximumLongitude - minimumLongitude, 0.01);

  return (
    <div className="bg-secondary/60 relative h-full min-h-[24rem] overflow-hidden rounded-2xl border">
      <div
        className="absolute inset-0 opacity-45"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="bg-card/95 text-muted-foreground absolute top-4 left-4 z-10 rounded-lg border px-3 py-2 text-xs shadow-sm">
        Map preview · connect Mapbox for live streets
      </div>
      {sales.map((sale, index) => {
        const left =
          8 + ((sale.longitude - minimumLongitude) / longitudeRange) * 84;
        const top =
          8 + ((maximumLatitude - sale.latitude) / latitudeRange) * 84;
        return (
          <Link
            key={sale.id}
            href={`/sale/${sale.id}`}
            className="group focus-visible:ring-ring absolute -translate-x-1/2 -translate-y-full rounded-full focus-visible:ring-2 focus-visible:outline-none"
            style={{ left: `${left}%`, top: `${top}%` }}
            aria-label={`View ${sale.title}`}
          >
            <span className="border-card bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-full border-2 shadow-md transition-transform group-hover:scale-110">
              <MapPin className="size-4" aria-hidden="true" />
            </span>
            {index < 4 ? (
              <span className="bg-foreground text-background pointer-events-none absolute top-[calc(100%+0.25rem)] left-1/2 hidden w-max max-w-40 -translate-x-1/2 rounded-md px-2 py-1 text-center text-[0.65rem] shadow group-hover:block sm:block">
                {sale.suburb}
              </span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
