import { describe, expect, it } from "vitest";

import { readCoordinates } from "@/modules/sales/mapper";

describe("readCoordinates", () => {
  it("reads the EWKB geography format returned by PostgREST", () => {
    expect(
      readCoordinates("0101000020E6100000B9FC87F4DBEF5C403A92CB7F480740C0"),
    ).toEqual([115.7478, -32.0569]);
  });

  it("continues to accept GeoJSON coordinates", () => {
    expect(readCoordinates({ coordinates: [115.75, -32.05] })).toEqual([
      115.75, -32.05,
    ]);
  });
});
