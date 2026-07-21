"use client";

import { LocateFixed, MapPin, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Suburb } from "@/types/sale";

type SuburbSearchProps = {
  className?: string;
  defaultLatitude?: number;
  defaultLongitude?: number;
  defaultQuery: string;
};

export function SuburbSearch({
  className,
  defaultLatitude,
  defaultLongitude,
  defaultQuery,
}: SuburbSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultQuery);
  const [latitude, setLatitude] = useState(defaultLatitude);
  const [longitude, setLongitude] = useState(defaultLongitude);
  const [suggestions, setSuggestions] = useState<Suburb[]>([]);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const requestNumber = useRef(0);

  useEffect(() => {
    if (query.trim().length < 2 || query === defaultQuery) {
      return;
    }

    const currentRequest = ++requestNumber.current;
    const timer = window.setTimeout(async () => {
      const response = await fetch(
        `/api/suburbs?q=${encodeURIComponent(query)}`,
      );
      if (!response.ok || currentRequest !== requestNumber.current) return;
      const result = (await response.json()) as { suburbs: Suburb[] };
      setSuggestions(result.suburbs);
    }, 180);

    return () => window.clearTimeout(timer);
  }, [defaultQuery, query]);

  function selectSuburb(suburb: Suburb) {
    setQuery(`${suburb.name}, ${suburb.state} ${suburb.postcode}`);
    setLatitude(suburb.latitude);
    setLongitude(suburb.longitude);
    setSuggestions([]);
  }

  function useCurrentLocation() {
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError("Location is not supported by this browser.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const parameters = new URLSearchParams({
          lat: String(position.coords.latitude),
          lng: String(position.coords.longitude),
          q: "My location",
        });
        router.push(`/?${parameters.toString()}`);
        setLocating(false);
      },
      () => {
        setLocationError(
          "We couldn't access your location. Search by suburb instead.",
        );
        setLocating(false);
      },
      { enableHighAccuracy: false, maximumAge: 300_000, timeout: 8_000 },
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <form
        action="/"
        className="bg-card shadow-primary/5 flex flex-col gap-2 rounded-2xl border p-2 shadow-lg sm:flex-row"
      >
        <div className="relative min-w-0 flex-1">
          <MapPin
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 z-10 size-5 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            name="q"
            value={query}
            onChange={(event) => {
              const nextQuery = event.target.value;
              setQuery(nextQuery);
              setLatitude(undefined);
              setLongitude(undefined);
              if (nextQuery.trim().length < 2) setSuggestions([]);
            }}
            placeholder="Enter a suburb or postcode"
            autoComplete="off"
            aria-label="Suburb or postcode"
            className="h-12 border-0 pl-10 text-base shadow-none focus-visible:ring-0"
          />
          {latitude !== undefined ? (
            <input type="hidden" name="lat" value={latitude} />
          ) : null}
          {longitude !== undefined ? (
            <input type="hidden" name="lng" value={longitude} />
          ) : null}
          {suggestions.length > 0 ? (
            <div className="bg-popover absolute top-[calc(100%+0.75rem)] right-0 left-0 z-40 overflow-hidden rounded-xl border shadow-xl">
              {suggestions.map((suburb) => (
                <button
                  key={suburb.slug}
                  type="button"
                  onClick={() => selectSuburb(suburb)}
                  className="hover:bg-muted focus-visible:bg-muted flex min-h-12 w-full items-center gap-3 border-b px-4 py-2 text-left text-sm transition-colors last:border-b-0 focus-visible:outline-none"
                >
                  <MapPin className="text-primary size-4" aria-hidden="true" />
                  <span>
                    <span className="font-medium">{suburb.name}</span>
                    <span className="text-muted-foreground ml-2">
                      {suburb.state} {suburb.postcode}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={useCurrentLocation}
            disabled={locating}
            className="h-12"
          >
            <LocateFixed aria-hidden="true" />
            {locating ? "Locating…" : "Use my location"}
          </Button>
          <Button type="submit" size="lg" className="h-12 px-6">
            <Search aria-hidden="true" />
            Search
          </Button>
        </div>
      </form>
      {locationError ? (
        <p className="text-destructive px-2 text-sm" role="alert">
          {locationError}
        </p>
      ) : null}
    </div>
  );
}
