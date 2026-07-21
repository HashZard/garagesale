import type { PublicSale } from "@/types/sale";

function escapeCalendarText(value: string): string {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,")
    .replaceAll("\r", "")
    .replaceAll("\n", "\\n");
}

function toCalendarUtc(value: string): string {
  return new Date(value)
    .toISOString()
    .replaceAll("-", "")
    .replaceAll(":", "")
    .replace(".000", "");
}

export function createSaleCalendar(sale: PublicSale, siteUrl: string): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//GarageSale.com.au//Garage Sale Event//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${sale.id}@garagesale.com.au`,
    `DTSTAMP:${toCalendarUtc(new Date().toISOString())}`,
    `DTSTART:${toCalendarUtc(sale.startAt)}`,
    `DTEND:${toCalendarUtc(sale.endAt)}`,
    `SUMMARY:${escapeCalendarText(sale.title)}`,
    `DESCRIPTION:${escapeCalendarText(sale.description ?? "Garage sale")}`,
    `LOCATION:${escapeCalendarText(sale.address)}`,
    `URL:${siteUrl}/sale/${sale.id}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return `${lines.join("\r\n")}\r\n`;
}
