import { describe, expect, it } from "vitest";

import {
  createPublishSaleSchema,
  manageSaleSchema,
} from "@/lib/validation/sale";

const validSale = {
  address: "12 Hampton Road, Fremantle WA 6160",
  categories: ["furniture"],
  contactEmail: "seller@example.com",
  description: "Moving sale",
  endTime: "13:00",
  latitude: -32.0569,
  localDate: "2026-07-25",
  longitude: 115.7478,
  photos: [],
  postcode: "6160",
  startTime: "08:00",
  state: "WA",
  suburb: "Fremantle",
  title: "Big moving sale",
  website: "",
} as const;

describe("发布校验", () => {
  const schema = createPublishSaleSchema(
    () => new Date("2026-07-19T00:00:00.000Z"),
  );

  it("接受未来的单日活动", () => {
    expect(schema.safeParse(validSale).success).toBe(true);
  });

  it("拒绝结束时间早于开始时间", () => {
    const result = schema.safeParse({ ...validSale, endTime: "07:00" });
    expect(result.success).toBe(false);
  });

  it("拒绝honeypot有内容的提交", () => {
    const result = schema.safeParse({ ...validSale, website: "spam" });
    expect(result.success).toBe(false);
  });

  it("拒绝澳大利亚范围之外的坐标", () => {
    const result = schema.safeParse({ ...validSale, latitude: 0 });
    expect(result.success).toBe(false);
  });

  it("限制图片数量和链接格式", () => {
    const tooManyPhotos = Array.from(
      { length: 7 },
      (_, index) => `https://example.com/${index}.jpg`,
    );
    expect(
      schema.safeParse({ ...validSale, photos: tooManyPhotos }).success,
    ).toBe(false);
    expect(
      schema.safeParse({ ...validSale, photos: ["javascript:alert(1)"] })
        .success,
    ).toBe(false);
  });
});

describe("管理校验", () => {
  const managedSale = {
    address: validSale.address,
    categories: validSale.categories,
    description: validSale.description,
    endTime: validSale.endTime,
    latitude: validSale.latitude,
    localDate: validSale.localDate,
    longitude: validSale.longitude,
    photos: validSale.photos,
    postcode: validSale.postcode,
    startTime: validSale.startTime,
    state: validSale.state,
    suburb: validSale.suburb,
    title: validSale.title,
  };

  it("允许修改已开始活动，但仍要求结束晚于开始", () => {
    expect(manageSaleSchema.safeParse(managedSale).success).toBe(true);
    expect(
      manageSaleSchema.safeParse({ ...managedSale, endTime: "07:00" }).success,
    ).toBe(false);
  });
});
