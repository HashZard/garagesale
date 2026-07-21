import { fromZonedTime, formatInTimeZone } from "date-fns-tz";

import type { AustralianState, DateFilter } from "@/types/sale";

export const STATE_TIMEZONES: Record<AustralianState, string> = {
  ACT: "Australia/Sydney",
  NSW: "Australia/Sydney",
  NT: "Australia/Darwin",
  QLD: "Australia/Brisbane",
  SA: "Australia/Adelaide",
  TAS: "Australia/Hobart",
  VIC: "Australia/Melbourne",
  WA: "Australia/Perth",
};

export function getStateTimeZone(state: AustralianState): string {
  return STATE_TIMEZONES[state];
}

export function localSaleTimeToDate(
  localDate: string,
  localTime: string,
  state: AustralianState,
): Date {
  return fromZonedTime(`${localDate}T${localTime}:00`, getStateTimeZone(state));
}

export function formatSaleDateTime(
  startAt: string | Date,
  endAt: string | Date,
  state: AustralianState,
): string {
  const timezone = getStateTimeZone(state);
  const dateLabel = formatInTimeZone(startAt, timezone, "EEE d MMM");
  const startLabel = formatInTimeZone(startAt, timezone, "h:mma")
    .replace(":00", "")
    .toLowerCase();
  const endLabel = formatInTimeZone(endAt, timezone, "h:mma")
    .replace(":00", "")
    .toLowerCase();

  return `${dateLabel}, ${startLabel}–${endLabel}`;
}

export function getLocalDate(
  instant: string | Date,
  state: AustralianState,
): string {
  return formatInTimeZone(instant, getStateTimeZone(state), "yyyy-MM-dd");
}

export function getLocalTime(
  instant: string | Date,
  state: AustralianState,
): string {
  return formatInTimeZone(instant, getStateTimeZone(state), "HH:mm");
}

export function isSameLocalSaleDay(
  startAt: string | Date,
  endAt: string | Date,
  state: AustralianState,
): boolean {
  return getLocalDate(startAt, state) === getLocalDate(endAt, state);
}

function addLocalCalendarDays(localDate: string, days: number): string {
  const date = new Date(`${localDate}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function getWeekendRange(
  filter: Exclude<DateFilter, "all">,
  state: AustralianState,
  now = new Date(),
): { end: Date; start: Date } {
  const localToday = getLocalDate(now, state);
  const weekday = new Date(`${localToday}T00:00:00.000Z`).getUTCDay();
  const daysToCurrentWeekend = weekday === 0 ? -1 : (6 - weekday + 7) % 7;
  const extraWeek = filter === "next-weekend" ? 7 : 0;
  const saturday = addLocalCalendarDays(
    localToday,
    daysToCurrentWeekend + extraWeek,
  );
  const monday = addLocalCalendarDays(saturday, 2);

  return {
    start: localSaleTimeToDate(saturday, "00:00", state),
    end: localSaleTimeToDate(monday, "00:00", state),
  };
}

export function matchesDateFilter(
  startAt: string | Date,
  state: AustralianState,
  filter: DateFilter,
  now = new Date(),
): boolean {
  if (filter === "all") return true;
  const range = getWeekendRange(filter, state, now);
  const start = new Date(startAt);
  return start >= range.start && start < range.end;
}
