import { describe, expect, it } from "vitest";

import { createSaleCalendar } from "@/lib/calendar";
import type { PublicSale } from "@/types/sale";

const sale: PublicSale = {
  address: "12 Hampton Road, Fremantle WA 6160",
  categories: ["furniture"],
  createdAt: "2026-07-19T00:00:00.000Z",
  description: "Furniture, tools; and more",
  endAt: "2026-07-25T05:00:00.000Z",
  id: "00000000-0000-4000-8000-000000000001",
  latitude: -32.0569,
  longitude: 115.7478,
  photos: [],
  postcode: "6160",
  source: "self",
  sourceUrl: null,
  startAt: "2026-07-25T00:00:00.000Z",
  state: "WA",
  suburb: "Fremantle",
  title: "Moving sale",
  updatedAt: "2026-07-19T00:00:00.000Z",
};

describe("日历文件", () => {
  it("生成UTC时间并转义文本", () => {
    const calendar = createSaleCalendar(sale, "https://garagesale.com.au");
    expect(calendar).toContain("DTSTART:20260725T000000Z");
    expect(calendar).toContain("DESCRIPTION:Furniture\\, tools\\; and more");
    expect(calendar).toContain(`UID:${sale.id}@garagesale.com.au`);
  });

  it("阻止回车换行注入新的日历字段", () => {
    const calendar = createSaleCalendar(
      { ...sale, title: "Sale\r\nATTENDEE:attacker@example.com" },
      "https://garagesale.com.au",
    );
    expect(calendar).not.toContain("\r\nATTENDEE:");
    expect(calendar).toContain("Sale\\nATTENDEE:");
  });
});
