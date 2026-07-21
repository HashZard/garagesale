import { describe, expect, it } from "vitest";

import {
  formatSaleDateTime,
  getWeekendRange,
  localSaleTimeToDate,
  matchesDateFilter,
} from "@/lib/geo/timezone";

describe("活动时区", () => {
  it("将 Perth 当地时间转换为正确UTC时间", () => {
    expect(localSaleTimeToDate("2026-07-25", "08:00", "WA").toISOString()).toBe(
      "2026-07-25T00:00:00.000Z",
    );
  });

  it("始终用活动当地时间格式化", () => {
    expect(
      formatSaleDateTime(
        "2026-07-25T00:00:00.000Z",
        "2026-07-25T05:00:00.000Z",
        "WA",
      ),
    ).toBe("Sat 25 Jul, 8am–1pm");
  });

  it("按活动当地日期计算本周末", () => {
    const now = new Date("2026-07-19T02:00:00.000Z");
    const range = getWeekendRange("this-weekend", "WA", now);

    expect(range.start.toISOString()).toBe("2026-07-17T16:00:00.000Z");
    expect(range.end.toISOString()).toBe("2026-07-19T16:00:00.000Z");
    expect(
      matchesDateFilter("2026-07-18T00:00:00.000Z", "WA", "this-weekend", now),
    ).toBe(true);
  });

  it("正确处理悉尼夏令时", () => {
    expect(
      localSaleTimeToDate("2026-12-05", "08:00", "NSW").toISOString(),
    ).toBe("2026-12-04T21:00:00.000Z");
  });
});
