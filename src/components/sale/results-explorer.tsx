"use client";

import { List, Map } from "lucide-react";
import { useState } from "react";

import { SaleMap } from "@/components/map/sale-map";
import { SaleList } from "@/components/sale/sale-list";
import { Button } from "@/components/ui/button";
import type { NearbySale } from "@/types/sale";

type ResultsExplorerProps = {
  locationLabel?: string;
  sales: NearbySale[];
};

export function ResultsExplorer({
  locationLabel,
  sales,
}: ResultsExplorerProps) {
  const [mobileView, setMobileView] = useState<"map" | "list">("map");

  return (
    <section aria-label="Garage sale results">
      <div className="bg-background/95 sticky top-20 z-30 mb-4 grid grid-cols-2 gap-2 rounded-xl border p-1.5 shadow-sm backdrop-blur xl:hidden">
        <Button
          variant={mobileView === "map" ? "default" : "ghost"}
          onClick={() => setMobileView("map")}
          aria-pressed={mobileView === "map"}
        >
          <Map aria-hidden="true" />
          Map
        </Button>
        <Button
          variant={mobileView === "list" ? "default" : "ghost"}
          onClick={() => setMobileView("list")}
          aria-pressed={mobileView === "list"}
        >
          <List aria-hidden="true" />
          List
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(30rem,0.95fr)]">
        <div className={mobileView === "map" ? "block" : "hidden xl:block"}>
          <div className="xl:sticky xl:top-24 xl:h-[calc(100vh-7.5rem)]">
            <SaleMap sales={sales} />
          </div>
        </div>
        <div className={mobileView === "list" ? "block" : "hidden xl:block"}>
          <SaleList sales={sales} locationLabel={locationLabel} />
        </div>
      </div>
    </section>
  );
}
