import { addDays, nextSaturday } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

import { localSaleTimeToDate } from "@/lib/geo/timezone";
import type { PublicSale, SaleCategory, Suburb } from "@/types/sale";

export const DEMO_SUBURBS: Suburb[] = [
  {
    id: 1,
    name: "Fremantle",
    state: "WA",
    postcode: "6160",
    slug: "fremantle-wa-6160",
    latitude: -32.0569,
    longitude: 115.7478,
  },
  {
    id: 2,
    name: "East Fremantle",
    state: "WA",
    postcode: "6158",
    slug: "east-fremantle-wa-6158",
    latitude: -32.0389,
    longitude: 115.7678,
  },
  {
    id: 3,
    name: "South Fremantle",
    state: "WA",
    postcode: "6162",
    slug: "south-fremantle-wa-6162",
    latitude: -32.0737,
    longitude: 115.754,
  },
  {
    id: 4,
    name: "Hamilton Hill",
    state: "WA",
    postcode: "6163",
    slug: "hamilton-hill-wa-6163",
    latitude: -32.084,
    longitude: 115.779,
  },
  {
    id: 5,
    name: "Bicton",
    state: "WA",
    postcode: "6157",
    slug: "bicton-wa-6157",
    latitude: -32.027,
    longitude: 115.783,
  },
];

const DEMO_TITLES = [
  "Big Moving Sale — Furniture & Tools",
  "Vintage Finds and Household Sale",
  "Books, Records and Retro Homewares",
  "Family Garage Clear-out",
  "Garden and Outdoor Equipment Sale",
  "Quality Furniture Downsizing Sale",
  "Kids Gear, Toys and Clothes",
  "Weekend Electronics Clear-out",
  "Beach House Moving Sale",
  "Collectables and Vinyl Records",
] as const;

const CATEGORY_PAIRS: SaleCategory[][] = [
  ["furniture", "tools"],
  ["collectables", "household"],
  ["books-media", "collectables"],
  ["kids-baby", "clothing"],
  ["garden", "tools"],
  ["furniture", "household"],
  ["kids-baby", "clothing"],
  ["electronics", "other"],
  ["furniture", "household"],
  ["collectables", "books-media"],
];

function getFirstDemoSaturday(): Date {
  const tomorrow = addDays(new Date(), 1);
  return nextSaturday(tomorrow);
}

export function createDemoSales(): PublicSale[] {
  const firstSaturday = getFirstDemoSaturday();

  return Array.from({ length: 20 }, (_, index) => {
    const suburb = DEMO_SUBURBS[index % DEMO_SUBURBS.length];
    if (!suburb) {
      throw new Error("Demo suburb data is missing");
    }

    const saleDate = addDays(
      firstSaturday,
      Math.floor(index / 10) * 7 + (index % 2),
    );
    const localDate = formatInTimeZone(
      saleDate,
      "Australia/Perth",
      "yyyy-MM-dd",
    );
    const startAt = localSaleTimeToDate(
      localDate,
      index % 3 === 0 ? "07:30" : "08:00",
      "WA",
    );
    const endAt = localSaleTimeToDate(
      localDate,
      index % 4 === 0 ? "14:00" : "13:00",
      "WA",
    );
    const external = (index + 1) % 5 === 0;
    const sequence = String(index + 1).padStart(12, "0");

    return {
      address: `${10 + index} ${suburb.name} Street, ${suburb.name} WA ${suburb.postcode}`,
      categories: CATEGORY_PAIRS[index % CATEGORY_PAIRS.length] ?? ["other"],
      createdAt: new Date().toISOString(),
      description:
        "Plenty of useful items available — arrive early for the best selection.",
      endAt: endAt.toISOString(),
      id: `00000000-0000-4000-8000-${sequence}`,
      latitude: suburb.latitude + ((index % 3) - 1) * 0.002,
      longitude: suburb.longitude + ((index % 4) - 1.5) * 0.002,
      photos: [],
      postcode: suburb.postcode,
      source: external ? "gumtree" : "self",
      sourceUrl: external ? `https://example.com/source/${index + 1}` : null,
      startAt: startAt.toISOString(),
      state: "WA",
      suburb: suburb.name,
      title: DEMO_TITLES[index % DEMO_TITLES.length] ?? "Garage Sale",
      updatedAt: new Date().toISOString(),
    };
  });
}
