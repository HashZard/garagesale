import type {
  AUSTRALIAN_STATES,
  DATE_FILTERS,
  SALE_CATEGORIES,
  SALE_SOURCES,
  SALE_STATUSES,
} from "@/config/constants";

export type AustralianState = (typeof AUSTRALIAN_STATES)[number];
export type SaleCategory = (typeof SALE_CATEGORIES)[number]["value"];
export type SaleSource = (typeof SALE_SOURCES)[number];
export type SaleStatus = (typeof SALE_STATUSES)[number];
export type DateFilter = (typeof DATE_FILTERS)[number]["value"];

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type PublicSale = Coordinates & {
  address: string;
  categories: SaleCategory[];
  createdAt: string;
  description: string | null;
  endAt: string;
  id: string;
  photos: string[];
  postcode: string;
  source: SaleSource;
  sourceUrl: string | null;
  startAt: string;
  state: AustralianState;
  suburb: string;
  title: string;
  updatedAt: string;
};

export type NearbySale = PublicSale & {
  distanceKm: number | null;
};

export type Suburb = Coordinates & {
  id: number;
  name: string;
  postcode: string;
  slug: string;
  state: AustralianState;
};

export type SaleSearchFilters = {
  categories: SaleCategory[];
  date: DateFilter;
  latitude?: number;
  longitude?: number;
  radiusKm: number;
  state?: AustralianState;
  suburbLabel?: string;
};
