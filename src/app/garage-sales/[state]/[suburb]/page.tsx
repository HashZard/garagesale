import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/container";
import { ResultsExplorer } from "@/components/sale/results-explorer";
import { Button } from "@/components/ui/button";
import { getUpcomingSales } from "@/lib/db/sales";
import { getNearbySuburbs, getSuburbBySlug } from "@/lib/db/suburbs";
import { parseStateSlug, STATE_NAMES, statePath } from "@/lib/geo/state";

import type { Metadata } from "next";

type SuburbPageProps = {
  params: Promise<{ state: string; suburb: string }>;
};

export const revalidate = 1800;

export async function generateMetadata({
  params,
}: SuburbPageProps): Promise<Metadata> {
  const values = await params;
  const state = parseStateSlug(values.state);
  if (!state) return {};
  const suburb = await getSuburbBySlug(values.suburb, state);
  if (!suburb) return {};
  return {
    title: `Garage sales in ${suburb.name}, ${state}`,
    description: `Find garage sales near ${suburb.name} ${state} ${suburb.postcode}, see exact addresses and plan your weekend route.`,
    alternates: { canonical: `${statePath(state)}/${suburb.slug}` },
  };
}

export default async function SuburbPage({ params }: SuburbPageProps) {
  const values = await params;
  const state = parseStateSlug(values.state);
  if (!state) notFound();
  const suburb = await getSuburbBySlug(values.suburb, state);
  if (!suburb) notFound();

  const [sales, nearbySuburbs] = await Promise.all([
    getUpcomingSales({
      categories: [],
      date: "all",
      latitude: suburb.latitude,
      longitude: suburb.longitude,
      radiusKm: 10,
      suburbLabel: `${suburb.name}, ${state} ${suburb.postcode}`,
    }),
    getNearbySuburbs(suburb),
  ]);

  return (
    <>
      <section className="from-secondary/70 to-background border-b bg-gradient-to-b">
        <Container className="py-10 sm:py-14">
          <p className="text-primary text-sm font-medium">
            {STATE_NAMES[state]} · {suburb.postcode}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Garage sales near {suburb.name}
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl">
            Browse upcoming sales within 10km, with complete addresses and exact
            map locations.
          </p>
        </Container>
      </section>
      <Container className="py-8 sm:py-10">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Upcoming local sales</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {sales.length} {sales.length === 1 ? "sale" : "sales"} found
            </p>
          </div>
          <Button asChild>
            <Link href="/publish">
              Publish in {suburb.name} <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <ResultsExplorer
          sales={sales}
          locationLabel={`${suburb.name}, ${state}`}
        />

        <section className="mt-12" aria-labelledby="nearby-areas">
          <h2 id="nearby-areas" className="text-xl font-semibold">
            Nearby areas
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {nearbySuburbs.map((nearby) => (
              <Button key={nearby.id} variant="outline" asChild>
                <Link href={`${statePath(state)}/${nearby.slug}`}>
                  {nearby.name} {nearby.postcode}
                </Link>
              </Button>
            ))}
            <Button variant="ghost" asChild>
              <Link href={statePath(state)}>
                All {STATE_NAMES[state]} areas
              </Link>
            </Button>
          </div>
        </section>
      </Container>
    </>
  );
}
