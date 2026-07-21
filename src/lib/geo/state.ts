import { AUSTRALIAN_STATES } from "@/config/constants";
import type { AustralianState } from "@/types/sale";

export const STATE_NAMES: Record<AustralianState, string> = {
  ACT: "Australian Capital Territory",
  NSW: "New South Wales",
  NT: "Northern Territory",
  QLD: "Queensland",
  SA: "South Australia",
  TAS: "Tasmania",
  VIC: "Victoria",
  WA: "Western Australia",
};

export function parseStateSlug(value: string): AustralianState | null {
  const state = value.toUpperCase();
  return AUSTRALIAN_STATES.includes(state as AustralianState)
    ? (state as AustralianState)
    : null;
}

export function statePath(state: AustralianState): string {
  return `/garage-sales/${state.toLowerCase()}`;
}
