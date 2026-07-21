import { describe, expect, it } from "vitest";

import { calculateDistanceKm } from "@/lib/geo/distance";

describe("地理距离", () => {
  it("计算 Fremantle 到 Bicton 的近似距离", () => {
    const distance = calculateDistanceKm(
      { latitude: -32.0569, longitude: 115.7478 },
      { latitude: -32.027, longitude: 115.783 },
    );

    expect(distance).toBeGreaterThan(4);
    expect(distance).toBeLessThan(6);
  });
});
