"use client";

import mapboxgl from "mapbox-gl";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { MAP_MARKER_COLOR, MAP_MARKER_FOREGROUND } from "@/config/constants";
import type { NearbySale } from "@/types/sale";

type LiveSaleMapProps = {
  sales: NearbySale[];
  token: string;
};

export function LiveSaleMap({ sales, token }: LiveSaleMapProps) {
  const container = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!container.current) return;

    mapboxgl.accessToken = token;
    const averageLongitude =
      sales.reduce((total, sale) => total + sale.longitude, 0) / sales.length;
    const averageLatitude =
      sales.reduce((total, sale) => total + sale.latitude, 0) / sales.length;
    const map = new mapboxgl.Map({
      center: [averageLongitude, averageLatitude],
      container: container.current,
      cooperativeGestures: true,
      style: "mapbox://styles/mapbox/streets-v12",
      zoom: 11,
    });
    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "top-right",
    );

    map.on("load", () => {
      map.addSource("sales", {
        type: "geojson",
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 45,
        data: {
          type: "FeatureCollection",
          features: sales.map((sale) => ({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [sale.longitude, sale.latitude],
            },
            properties: { id: sale.id, title: sale.title },
          })),
        },
      });
      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "sales",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": MAP_MARKER_COLOR,
          "circle-radius": ["step", ["get", "point_count"], 18, 10, 24],
          "circle-stroke-color": MAP_MARKER_FOREGROUND,
          "circle-stroke-width": 2,
        },
      });
      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "sales",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-size": 12,
        },
        paint: { "text-color": MAP_MARKER_FOREGROUND },
      });
      map.addLayer({
        id: "sale-points",
        type: "circle",
        source: "sales",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": MAP_MARKER_COLOR,
          "circle-radius": 8,
          "circle-stroke-color": MAP_MARKER_FOREGROUND,
          "circle-stroke-width": 3,
        },
      });
      map.on("click", "sale-points", (event) => {
        const id = event.features?.[0]?.properties?.id as string | undefined;
        if (id) router.push(`/sale/${id}`);
      });
      map.on("mouseenter", "sale-points", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "sale-points", () => {
        map.getCanvas().style.cursor = "";
      });
    });

    return () => map.remove();
  }, [router, sales, token]);

  return (
    <div
      ref={container}
      className="h-full min-h-[24rem] overflow-hidden rounded-2xl border"
    />
  );
}
