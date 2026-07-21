import { ArrowRight, MapPin } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/container";
import { SaleList } from "@/components/sale/sale-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AUSTRALIAN_STATES } from "@/config/constants";
import { getUpcomingSales } from "@/lib/db/sales";
import { getSuburbsByState } from "@/lib/db/suburbs";
import { parseStateSlug, STATE_NAMES, statePath } from "@/lib/geo/state";

import type { Metadata } from "next";

type StatePageProps = { params: Promise<{ state: string }> };

export const revalidate = 3600;

export function generateStaticParams() {
  return AUSTRALIAN_STATES.map((state) => ({ state: state.toLowerCase() }));
}

export async function generateMetadata({
  params,
}: StatePageProps): Promise<Metadata> {
  const state = parseStateSlug((await params).state);
  if (!state) return {};
  return {
    title: `Garage sales in ${STATE_NAMES[state]}`,
    description: `Find upcoming garage sales across ${STATE_NAMES[state]}, browse local areas and publish your own sale free.`,
    alternates: { canonical: statePath(state) },
  };
}

export default async function StatePage({ params }: StatePageProps) {
  const state = parseStateSlug((await params).state);
  if (!state) notFound();
  const [suburbs, sales] = await Promise.all([
    getSuburbsByState(state),
    getUpcomingSales({
      categories: [],
      date: "all",
      radiusKm: 25,
      state,
    }),
  ]);

  return (
    <Container className="py-10 sm:py-14">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-primary text-sm font-medium">Browse by state</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Garage sales in {STATE_NAMES[state]}
          </h1>
          <p className="text-muted-foreground mt-3">
            Plan a local treasure hunt or list your own weekend sale in minutes.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/publish">
            Publish a sale <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>

      <section className="mt-10" aria-labelledby="upcoming-sales">
        <h2 id="upcoming-sales" className="text-2xl font-semibold">
          Upcoming sales
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          {sales.length} active {sales.length === 1 ? "listing" : "listings"}
        </p>
        <div className="mt-5">
          {sales.length > 0 ? (
            <SaleList sales={sales} />
          ) : (
            <Card>
              <CardContent className="p-7 text-center">
                <p className="font-medium">No upcoming sales listed yet.</p>
                <p className="text-muted-foreground mt-2 text-sm">
                  Be the first to publish a garage sale in {STATE_NAMES[state]}.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <section className="mt-12" aria-labelledby="browse-areas">
        <h2 id="browse-areas" className="text-2xl font-semibold">
          Browse local areas
        </h2>
        {suburbs.length > 0 ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {suburbs.map((suburb) => (
              <Link
                key={suburb.id}
                href={`${statePath(state)}/${suburb.slug}`}
                className="hover:border-primary bg-card flex items-center gap-3 rounded-xl border p-4 transition-colors"
              >
                <MapPin className="text-primary size-4" aria-hidden="true" />
                <span>
                  <span className="block font-medium">{suburb.name}</span>
                  <span className="text-muted-foreground text-xs">
                    {suburb.state} {suburb.postcode}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground mt-4 text-sm">
            Local area links will appear after the licensed suburb dataset is
            connected.
          </p>
        )}
      </section>
    </Container>
  );
}
