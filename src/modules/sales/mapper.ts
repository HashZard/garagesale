import type { AdminSale } from "@/types/admin";
import type { Database, Tables } from "@/types/database.generated";
import type { ManagedSale } from "@/types/manage";
import type {
  AustralianState,
  NearbySale,
  PublicSale,
  SaleCategory,
  SaleSource,
  SaleStatus,
} from "@/types/sale";

type PublicSaleRow = Database["public"]["Views"]["public_sales"]["Row"];
type NearbySaleRow =
  Database["public"]["Functions"]["get_upcoming_sales_near"]["Returns"][number];
type SaleRow = Tables<"sales">;

export function readCoordinates(location: unknown): [number, number] | null {
  if (typeof location === "string" && /^[0-9a-f]+$/i.test(location)) {
    const bytes = new Uint8Array(location.length / 2);
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Number.parseInt(
        location.slice(index * 2, index * 2 + 2),
        16,
      );
    }
    if (bytes.length >= 21) {
      const view = new DataView(bytes.buffer);
      const littleEndian = bytes[0] === 1;
      const geometryType = view.getUint32(1, littleEndian);
      const coordinateOffset = geometryType & 0x20000000 ? 9 : 5;
      if (bytes.length >= coordinateOffset + 16) {
        return [
          view.getFloat64(coordinateOffset, littleEndian),
          view.getFloat64(coordinateOffset + 8, littleEndian),
        ];
      }
    }
  }
  if (!location || typeof location !== "object") return null;
  const coordinates = (location as { coordinates?: unknown }).coordinates;
  return Array.isArray(coordinates) &&
    typeof coordinates[0] === "number" &&
    typeof coordinates[1] === "number"
    ? [coordinates[0], coordinates[1]]
    : null;
}

export function mapPublicSaleRow(row: PublicSaleRow): PublicSale | null {
  if (
    !row.id ||
    !row.title ||
    !row.address ||
    !row.suburb ||
    !row.state ||
    !row.postcode ||
    row.longitude === null ||
    row.latitude === null ||
    !row.start_at ||
    !row.end_at ||
    !row.source
  ) {
    return null;
  }

  return {
    address: row.address,
    categories: (row.categories ?? []) as SaleCategory[],
    createdAt: row.created_at ?? "",
    description: row.description,
    endAt: row.end_at,
    id: row.id,
    latitude: row.latitude,
    longitude: row.longitude,
    photos: row.photos ?? [],
    postcode: row.postcode,
    source: row.source as SaleSource,
    sourceUrl: row.source_url,
    startAt: row.start_at,
    state: row.state as AustralianState,
    suburb: row.suburb,
    title: row.title,
    updatedAt: row.updated_at ?? "",
  };
}

export function mapNearbySaleRow(row: NearbySaleRow): NearbySale {
  return {
    address: row.address,
    categories: row.categories as SaleCategory[],
    createdAt: "",
    description: row.description,
    distanceKm: row.distance_km,
    endAt: row.end_at,
    id: row.id,
    latitude: row.latitude,
    longitude: row.longitude,
    photos: row.photos,
    postcode: row.postcode,
    source: row.source as SaleSource,
    sourceUrl: row.source_url,
    startAt: row.start_at,
    state: row.state as AustralianState,
    suburb: row.suburb,
    title: row.title,
    updatedAt: "",
  };
}

function mapPrivateSale(
  row: SaleRow,
  contactEmail: string | null,
): AdminSale | ManagedSale | null {
  const coordinates = readCoordinates(row.location);
  if (!coordinates) return null;
  return {
    address: row.address,
    categories: row.categories as SaleCategory[],
    contactEmail,
    createdAt: row.created_at,
    description: row.description,
    endAt: row.end_at,
    id: row.id,
    latitude: coordinates[1],
    longitude: coordinates[0],
    photos: row.photos,
    postcode: row.postcode,
    source: row.source as SaleSource,
    sourceUrl: row.source_url,
    startAt: row.start_at,
    state: row.state as AustralianState,
    status: row.status as SaleStatus,
    suburb: row.suburb,
    title: row.title,
    updatedAt: row.updated_at,
  } as AdminSale | ManagedSale;
}

export function mapAdminSale(
  row: SaleRow,
  contactEmail: string | null,
): AdminSale | null {
  return mapPrivateSale(row, contactEmail) as AdminSale | null;
}

export function mapManagedSale(
  row: SaleRow,
  contactEmail: string,
): ManagedSale | null {
  return mapPrivateSale(row, contactEmail) as ManagedSale | null;
}
