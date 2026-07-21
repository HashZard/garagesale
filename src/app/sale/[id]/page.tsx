import { CalendarPlus, ExternalLink, MapPin, Navigation } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/container";
import { JsonLd } from "@/components/json-ld";
import { SaleMap } from "@/components/map/sale-map";
import { SaleGallery } from "@/components/sale/sale-gallery";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SALE_CATEGORIES } from "@/config/constants";
import { getSiteUrl } from "@/config/site";
import { getPublicSaleById } from "@/lib/db/sales";
import { formatSaleDateTime } from "@/lib/geo/timezone";

import type { Metadata } from "next";

type SalePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: SalePageProps): Promise<Metadata> {
  const { id } = await params;
  const sale = await getPublicSaleById(id);
  if (!sale) {
    return {
      title: "Sale not found",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: sale.title,
    description: `${formatSaleDateTime(sale.startAt, sale.endAt, sale.state)} at ${sale.address}.`,
    alternates: { canonical: `/sale/${sale.id}` },
    openGraph: {
      title: sale.title,
      description:
        sale.description ?? `Garage sale in ${sale.suburb}, ${sale.state}`,
      images: sale.photos[0] ? [sale.photos[0]] : undefined,
    },
  };
}

export default async function SalePage({ params }: SalePageProps) {
  const { id } = await params;
  const sale = await getPublicSaleById(id);
  if (!sale) notFound();

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${sale.latitude},${sale.longitude}`)}`;
  const sourceLabel =
    sale.source.charAt(0).toUpperCase() + sale.source.slice(1);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: sale.title,
    description: sale.description ?? undefined,
    startDate: sale.startAt,
    endDate: sale.endAt,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    image: sale.photos,
    location: {
      "@type": "Place",
      name: sale.address,
      address: {
        "@type": "PostalAddress",
        streetAddress: sale.address,
        addressLocality: sale.suburb,
        addressRegion: sale.state,
        postalCode: sale.postcode,
        addressCountry: "AU",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: sale.latitude,
        longitude: sale.longitude,
      },
    },
    url: `${getSiteUrl()}/sale/${sale.id}`,
  };

  return (
    <Container className="py-8 sm:py-12">
      <JsonLd data={jsonLd} />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <article className="min-w-0 space-y-8">
          <header>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge>
                {sale.source === "self"
                  ? "Local listing"
                  : `via ${sourceLabel}`}
              </Badge>
              {sale.categories.map((category) => (
                <Badge key={category} variant="secondary">
                  {SALE_CATEGORIES.find((item) => item.value === category)
                    ?.label ?? category}
                </Badge>
              ))}
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              {sale.title}
            </h1>
            <p className="text-primary mt-3 text-lg font-medium">
              {formatSaleDateTime(sale.startAt, sale.endAt, sale.state)}
            </p>
          </header>

          <SaleGallery photos={sale.photos} title={sale.title} />

          <section aria-labelledby="about-sale">
            <h2 id="about-sale" className="text-xl font-semibold">
              About this sale
            </h2>
            <p className="text-muted-foreground mt-3 leading-7 whitespace-pre-wrap">
              {sale.description || "The seller has not added a description."}
            </p>
          </section>

          <section aria-labelledby="sale-location" className="space-y-4">
            <div>
              <h2 id="sale-location" className="text-xl font-semibold">
                Location
              </h2>
              <p className="text-muted-foreground mt-2 flex items-start gap-2">
                <MapPin
                  className="text-primary mt-0.5 size-5 shrink-0"
                  aria-hidden="true"
                />
                {sale.address}
              </p>
            </div>
            <div className="h-80">
              <SaleMap sales={[{ ...sale, distanceKm: null }]} />
            </div>
          </section>
        </article>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardContent className="space-y-3 p-5">
              <Button asChild size="lg" className="w-full">
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Navigation aria-hidden="true" />
                  Get directions
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full">
                <a href={`/sale/${sale.id}/calendar`}>
                  <CalendarPlus aria-hidden="true" />
                  Add to calendar
                </a>
              </Button>
              {sale.source !== "self" && sale.sourceUrl ? (
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="w-full"
                >
                  <a
                    href={sale.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View original listing
                    <ExternalLink aria-hidden="true" />
                  </a>
                </Button>
              ) : null}
            </CardContent>
          </Card>

          {sale.source !== "self" ? (
            <p className="bg-muted text-muted-foreground rounded-xl p-4 text-xs leading-5">
              Listed via {sourceLabel}. Details may change — check the original
              listing before you go.
            </p>
          ) : null}

          <Link
            href="/"
            className="text-primary inline-flex text-sm font-medium hover:underline"
          >
            ← Back to all garage sales
          </Link>
        </aside>
      </div>
    </Container>
  );
}
