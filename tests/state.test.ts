import { describe, expect, it } from "vitest";

import { parseStateSlug, statePath } from "@/lib/geo/state";

describe("州路由", () => {
  it("接受大小写州缩写并生成规范路径", () => {
    expect(parseStateSlug("wa")).toBe("WA");
    expect(parseStateSlug("NSW")).toBe("NSW");
    expect(statePath("ACT")).toBe("/garage-sales/act");
  });

  it("拒绝未知州", () => {
    expect(parseStateSlug("perth")).toBeNull();
  });
});
