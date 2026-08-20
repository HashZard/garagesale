import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/container";
import { SearchFilters } from "@/components/forms/search-filters";
import { SuburbSearch } from "@/components/forms/suburb-search";
import { ResultsExplorer } from "@/components/sale/results-explorer";
import { Button } from "@/components/ui/button";
import { SALE_CATEGORIES } from "@/config/constants";
import { isSearchEngineIndexingEnabled } from "@/config/site";
import { getUpcomingSales } from "@/lib/db/sales";
import { searchSuburbs } from "@/lib/db/suburbs";
import type { DateFilter, SaleCategory, SaleSearchFilters } from "@/types/sale";

import type { Metadata } from "next";

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  searchParams,
}: HomePageProps): Promise<Metadata> {
  const parameters = await searchParams;
  const hasSearch = Object.values(parameters).some((value) =>
    Array.isArray(value) ? value.length > 0 : Boolean(value),
  );
  return {
    alternates: { canonical: "/" },
    robots:
      isSearchEngineIndexingEnabled() && !hasSearch
        ? undefined
        : { index: false, follow: false },
  };
}

function getSingleValue(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function getSelectedCategories(
  value: string | string[] | undefined,
): SaleCategory[] {
  if (!value) return [];
  const allowed = new Set(SALE_CATEGORIES.map((category) => category.value));
  const values = Array.isArray(value) ? value : value.split(",");
  return values.filter((category): category is SaleCategory =>
    allowed.has(category as SaleCategory),
  );
}

function getDateFilter(value: string | undefined): DateFilter {
  if (value === "this-weekend" || value === "next-weekend") return value;
  return "all";
}

export default async function Home({ searchParams }: HomePageProps) {
  const parameters = await searchParams;
  const query = getSingleValue(parameters.q)?.trim();
  const rawLatitude = Number(getSingleValue(parameters.lat));
  const rawLongitude = Number(getSingleValue(parameters.lng));
  let latitude = Number.isFinite(rawLatitude) ? rawLatitude : undefined;
  let longitude = Number.isFinite(rawLongitude) ? rawLongitude : undefined;
  let suburbLabel = query;

  if (query && (latitude === undefined || longitude === undefined)) {
    const [match] = await searchSuburbs(query);
    if (match) {
      latitude = match.latitude;
      longitude = match.longitude;
      suburbLabel = `${match.name}, ${match.state} ${match.postcode}`;
    }
  }

  const requestedRadius = Number(getSingleValue(parameters.radius));
  const radiusKm = [5, 10, 25, 50].includes(requestedRadius)
    ? requestedRadius
    : 25;
  const filters: SaleSearchFilters = {
    categories: getSelectedCategories(parameters.categories),
    date: getDateFilter(getSingleValue(parameters.date)),
    latitude,
    longitude,
    radiusKm,
    suburbLabel,
  };
  const sales = await getUpcomingSales(filters);

  return (
    <>
      <section className="from-secondary/80 to-background border-b bg-gradient-to-b">
        <Container className="py-10 sm:py-14">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
              Find garage sales near you this weekend
            </h1>
            <p className="text-muted-foreground mt-4 text-base text-balance sm:text-lg">
              Search local sales, see them on the map and plan your treasure
              hunt.
            </p>
          </div>
          <SuburbSearch
            className="mt-7 max-w-3xl"
            defaultQuery={query ?? ""}
            defaultLatitude={latitude}
            defaultLongitude={longitude}
          />
        </Container>
      </section>

      <Container className="py-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-primary text-sm font-medium">
                {suburbLabel
                  ? `Near ${suburbLabel}`
                  : "Upcoming across Australia"}
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                {sales.length} garage {sales.length === 1 ? "sale" : "sales"}{" "}
                found
              </h2>
            </div>
            <Button variant="outline" size="lg" asChild>
              <Link href="/publish" prefetch={false}>
                Having a sale? Publish it free
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <SearchFilters filters={filters} query={query} />
          <ResultsExplorer sales={sales} locationLabel={suburbLabel} />
        </div>
      </Container>
    </>
  );
}
