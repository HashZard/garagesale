"use client";

import dynamic from "next/dynamic";

import { DemoMap } from "@/components/map/demo-map";
import type { NearbySale } from "@/types/sale";

const LiveSaleMap = dynamic(
  () =>
    import("@/components/map/live-sale-map").then(
      (module) => module.LiveSaleMap,
    ),
  {
    loading: () => (
      <div
        className="bg-muted h-full min-h-[24rem] animate-pulse rounded-2xl border"
        aria-label="Loading map"
      />
    ),
    ssr: false,
  },
);

type SaleMapProps = {
  sales: NearbySale[];
};

export function SaleMap({ sales }: SaleMapProps) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!token || sales.length === 0) return <DemoMap sales={sales} />;
  return <LiveSaleMap sales={sales} token={token} />;
}
