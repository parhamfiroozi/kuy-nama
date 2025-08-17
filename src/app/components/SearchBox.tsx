"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type maplibregl from "maplibre-gl";

type Props = {
  map: maplibregl.Map | null;
  placeholder?: string;
  className?: string;
};

type GeoFeature = {
  type: "Feature";
  properties: {
    display_name: string;
  };
  bbox?: [number, number, number, number]; // [west,south,east,north]
  geometry: { type: "Point"; coordinates: [number, number] };
};

export default function SearchBox({
  map,
  placeholder = "جستجو در شیراز…",
  className = "",
}: Props) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GeoFeature[]>([]);
  const [open, setOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // simple debounce
  const debouncedQ = useDebounce(q, 300);

  useEffect(() => {
    if (!debouncedQ.trim()) {
      setResults([]);
      return;
    }
    // cancel any in-flight request
    abortRef.current?.abort();
    const ctl = new AbortController();
    abortRef.current = ctl;
    (async () => {
      try {
        setLoading(true);
        // Bias to Shiraz (approx bbox) + fa language + limit
        // bbox: west=52.43, south=29.53, east=52.64, north=29.73
        const url = new URL("https://nominatim.openstreetmap.org/search");
        url.searchParams.set("format", "geojson");
        url.searchParams.set("q", debouncedQ);
        url.searchParams.set("limit", "7");
        url.searchParams.set("accept-language", "fa");
        url.searchParams.set("countrycodes", "ir");
        url.searchParams.set("bounded", "1");
        url.searchParams.set("viewbox", "52.43,29.73,52.64,29.53");

        const res = await fetch(url.toString(), {
          signal: ctl.signal,
          headers: {
            // being polite helps and some setups require a UA
            "Accept-Language": "fa",
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setResults((data?.features || []) as GeoFeature[]);
        setOpen(true);
      } catch (e) {
        if ((e as any).name !== "AbortError") {
          console.error("[search] error", e);
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => ctl.abort();
  }, [debouncedQ]);

  const onPick = (f: GeoFeature) => {
    setOpen(false);
    setQ(f.properties.display_name);
    const pt = f.geometry.coordinates as [number, number];
    // prefer bbox to set a nice view; fallback to a flyTo on point
    if (f.bbox && map) {
      const [west, south, east, north] = f.bbox;
      map.fitBounds(
        [
          [west, south],
          [east, north],
        ],
        { padding: 64, duration: 700 }
      );
    } else if (map) {
      map.flyTo({
        center: pt,
        zoom: Math.max(map.getZoom(), 14),
        duration: 700,
      });
    }
  };

  return (
    <div className={`relative ${className}`} dir="rtl">
      <input
        ref={inputRef}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => results.length && setOpen(true)}
        placeholder={placeholder}
        className="w-[min(80vw,520px)] rounded-full bg-white/95 text-[15px] px-4 py-2 shadow-md outline-none focus:ring-2 focus:ring-[#ff5a3c] text-neutral-900"
      />
      {loading && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500">
          …
        </span>
      )}
      {open && results.length > 0 && (
        <div className="absolute mt-2 w-full max-h-72 overflow-auto rounded-2xl bg-white/98 shadow-xl ring-1 ring-black/5">
          <ul className="divide-y divide-neutral-100">
            {results.map((f, i) => (
              <li key={i}>
                <button
                  onClick={() => onPick(f)}
                  className="block w-full text-right px-4 py-3 hover:bg-neutral-100 text-neutral-800"
                >
                  {f.properties.display_name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function useDebounce<T>(value: T, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}
