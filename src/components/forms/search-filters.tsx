import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DATE_FILTERS,
  RADIUS_OPTIONS_KM,
  SALE_CATEGORIES,
} from "@/config/constants";
import type { SaleSearchFilters } from "@/types/sale";

type SearchFiltersProps = {
  filters: SaleSearchFilters;
  query?: string;
};

export function SearchFilters({ filters, query }: SearchFiltersProps) {
  return (
    <details
      className="group bg-card rounded-2xl border shadow-sm"
      open={filters.categories.length > 0}
    >
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-medium marker:hidden">
        <span className="flex items-center gap-2">
          <SlidersHorizontal
            className="text-primary size-4"
            aria-hidden="true"
          />
          Filters
        </span>
        <span className="text-muted-foreground text-xs group-open:hidden">
          {filters.radiusKm} km · {filters.date.replaceAll("-", " ")}
        </span>
      </summary>
      <form
        action="/"
        className="grid gap-5 border-t p-4 md:grid-cols-[1fr_1fr_2fr_auto] md:items-end"
      >
        {query ? <input type="hidden" name="q" value={query} /> : null}
        {filters.latitude !== undefined ? (
          <input type="hidden" name="lat" value={filters.latitude} />
        ) : null}
        {filters.longitude !== undefined ? (
          <input type="hidden" name="lng" value={filters.longitude} />
        ) : null}

        <label className="grid gap-2 text-sm font-medium">
          Date
          <select
            name="date"
            defaultValue={filters.date}
            className="bg-background h-11 rounded-lg border px-3 text-sm"
          >
            {DATE_FILTERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium">
          Radius
          <select
            name="radius"
            defaultValue={filters.radiusKm}
            className="bg-background h-11 rounded-lg border px-3 text-sm"
          >
            {RADIUS_OPTIONS_KM.map((radius) => (
              <option key={radius} value={radius}>
                {radius} km
              </option>
            ))}
          </select>
        </label>

        <fieldset className="grid gap-2">
          <legend className="text-sm font-medium">Categories</legend>
          <div className="flex flex-wrap gap-2">
            {SALE_CATEGORIES.map((category) => (
              <label key={category.value} className="cursor-pointer">
                <input
                  type="checkbox"
                  name="categories"
                  value={category.value}
                  defaultChecked={filters.categories.includes(category.value)}
                  className="peer sr-only"
                />
                <span className="bg-background peer-checked:border-primary peer-checked:bg-secondary peer-checked:text-primary peer-focus-visible:ring-ring inline-flex min-h-9 items-center rounded-full border px-3 text-xs font-medium transition-colors peer-focus-visible:ring-2">
                  {category.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <Button type="submit" size="lg">
          Apply filters
        </Button>
      </form>
    </details>
  );
}
