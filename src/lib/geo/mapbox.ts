import "server-only";

import { AUSTRALIAN_STATES } from "@/config/constants";
import { getServerEnv } from "@/lib/env";
import type { AustralianState } from "@/types/sale";

type MapboxFeature = {
  properties?: {
    context?: {
      place?: { name?: string };
      postcode?: { name?: string };
      region?: { region_code?: string };
    };
    coordinates?: { latitude?: number; longitude?: number };
    full_address?: string;
    name?: string;
  };
};

export class AddressVerificationError extends Error {
  constructor() {
    super("Choose a complete Australian address from the suggestions");
    this.name = "AddressVerificationError";
  }
}

function normaliseState(
  regionCode: string | undefined,
): AustralianState | null {
  const state = regionCode?.replace(/^AU-/, "");
  return AUSTRALIAN_STATES.includes(state as AustralianState)
    ? (state as AustralianState)
    : null;
}

/**
 * 真实数据模式下始终重新地理编码，不信任浏览器提交的地址结构或坐标。
 * permanent=true 与持久化地址/坐标的产品行为保持一致，启用前需确认 Mapbox 许可。
 */
type AddressInput = {
  address: string;
  latitude: number;
  longitude: number;
  postcode: string;
  state: AustralianState;
  suburb: string;
};

export async function verifyAustralianAddress<T extends AddressInput>(
  input: T,
): Promise<T> {
  const environment = getServerEnv();
  if (environment.APP_DATA_MODE === "demo") return input;

  const parameters = new URLSearchParams({
    access_token: environment.MAPBOX_SERVER_TOKEN!,
    country: "au",
    limit: "1",
    permanent: "true",
    q: input.address,
    types: "address",
  });
  const response = await fetch(
    `https://api.mapbox.com/search/geocode/v6/forward?${parameters}`,
    { cache: "no-store" },
  );
  if (!response.ok) throw new AddressVerificationError();

  const result = (await response.json()) as { features?: MapboxFeature[] };
  const properties = result.features?.[0]?.properties;
  const context = properties?.context;
  const latitude = properties?.coordinates?.latitude;
  const longitude = properties?.coordinates?.longitude;
  const state = normaliseState(context?.region?.region_code);
  const postcode = context?.postcode?.name;
  const suburb = context?.place?.name;
  const address = properties?.full_address ?? properties?.name;

  if (
    !address ||
    !suburb ||
    !postcode?.match(/^\d{4}$/) ||
    !state ||
    typeof latitude !== "number" ||
    typeof longitude !== "number"
  ) {
    throw new AddressVerificationError();
  }

  return {
    ...input,
    address,
    latitude,
    longitude,
    postcode,
    state,
    suburb,
  } as T;
}
