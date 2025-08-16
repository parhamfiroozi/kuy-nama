"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import type { Map as MLMap } from "maplibre-gl";
import { listingsGeoJSON } from "@/data/listings";
import { buildingsGeoJSON } from "@/data/buildings";

type Mode = "all" | "sale" | "rent";

export default function MapView({
  mode = "all",
  onReady,
}: {
  mode?: Mode;
  onReady?: (map: MLMap) => void;
}) {
  const mapRef = useRef<MLMap | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const STYLE_URL = "/style/kuy-nama.json";
  const ICON_NAME = "building-logo";
  const ICON_URL = "/images/building-pin.png"; // ← put your logo here (public/images/building-pin.png)

  type Bbox = { west: number; south: number; east: number; north: number };
  const clamp = (n: number, a: number, b: number) =>
    Math.max(a, Math.min(b, n));
  git remote remove origin

  // Build a viewport-aligned grid (NxN). Average listing prices per cell.
  const buildPriceGrid = (bbox: Bbox, N = 36) => {
    const { west, south, east, north } = bbox;
    const dx = (east - west) / N;
    const dy = (north - south) / N;
    const buckets = new globalThis.Map<
      string,
      { sum: number; count: number; poly: any }
    >();

    // choose features based on mode
    const feats = listingsGeoJSON.features.filter((f: any) =>
      mode === "all" ? true : f.properties.listingType === mode
    );

    const makePoly = (ix: number, iy: number) => {
      const x0 = west + ix * dx,
        x1 = x0 + dx;
      const y0 = south + iy * dy,
        y1 = y0 + dy;
      return {
        type: "Feature",
        properties: { avgPrice: 0, count: 0, ix, iy },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [x0, y0],
              [x1, y0],
              [x1, y1],
              [x0, y1],
              [x0, y0],
            ],
          ],
        },
      };
    };

    for (const f of feats) {
      const [lng, lat] = f.geometry.coordinates as [number, number];
      if (lng < west || lng > east || lat < south || lat > north) continue;
      const ix = clamp(Math.floor((lng - west) / dx), 0, N - 1);
      const iy = clamp(Math.floor((lat - south) / dy), 0, N - 1);
      const key = `${ix},${iy}`;
      let b = buckets.get(key);
      if (!b) {
        b = { sum: 0, count: 0, poly: makePoly(ix, iy) };
        buckets.set(key, b);
      }
      const price = Number((f.properties as any).price) || 0;
      if (price > 0) {
        b.sum += price;
        b.count += 1;
      }
    }

    const features: any[] = [];
    for (const { sum, count, poly } of buckets.values()) {
      if (!count) continue;
      poly.properties.avgPrice = sum / count;
      poly.properties.count = count;
      features.push(poly);
    }
    return { type: "FeatureCollection", features };
  };

  const getPriceRange = (fc: any): [number, number] => {
    let min = Infinity,
      max = -Infinity;
    for (const f of fc.features) {
      const v = Number(f.properties.avgPrice) || 0;
      if (v < min) min = v;
      if (v > max) max = v;
    }
    if (!isFinite(min) || !isFinite(max) || min === Infinity) {
      min = 0;
      max = 1;
    }
    if (min === max) max = min + 1;
    return [min, max];
  };

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current!,
      style: STYLE_URL,
      center: [52.537, 29.62],
      zoom: 12.2,
      pitch: 45,
      bearing: -10,
      hash: true,
    });
    mapRef.current = map;
    map.addControl(
      new maplibregl.NavigationControl({ visualizePitch: true }),
      "top-right"
    );
    map.on("error", (e) => console.error("[MapLibre error]", e));

    // Build + add/refresh the price grid overlay
    const upsertPriceGrid = () => {
      const b = map.getBounds();
      const bbox: Bbox = {
        west: b.getWest(),
        south: b.getSouth(),
        east: b.getEast(),
        north: b.getNorth(),
      };
      const grid = buildPriceGrid(bbox, 36);
      const [minP, maxP] = getPriceRange(grid);

      if (!map.getSource("price-grid")) {
        map.addSource("price-grid", { type: "geojson", data: grid });
        map.addLayer({
          id: "price-grid-fill",
          type: "fill",
          source: "price-grid",
          paint: {
            "fill-color": "#000000",
            "fill-opacity": [
              "interpolate",
              ["linear"],
              ["to-number", ["get", "avgPrice"]],
              minP,
              0.05, // cheapest: barely tinted
              maxP,
              0.5, // most expensive: darker
            ],
          },
        });
        map.addLayer({
          id: "price-grid-outline",
          type: "line",
          source: "price-grid",
          paint: {
            "line-color": "#8cb2b2",
            "line-opacity": 0.15,
            "line-width": 0.5,
          },
        });
      } else {
        (map.getSource("price-grid") as any).setData(grid);
      }
    };

    // Add buildings: custom icon + hover card + click to zoom
    const addBuildings = async () => {
      if (!map.getSource("buildings")) {
        map.addSource("buildings", { type: "geojson", data: buildingsGeoJSON });
      }

      // Load your custom icon (from /public/images)
      await new Promise<void>((resolve, reject) => {
        if (map.hasImage(ICON_NAME)) return resolve();
        (map as any).loadImage(ICON_URL, (err: any, img: any) => {
          if (err) return reject(err);
          if (!map.hasImage(ICON_NAME))
            map.addImage(ICON_NAME, img, { sdf: false });
          resolve();
        });
      });

      if (!map.getLayer("building-icons")) {
        map.addLayer(
          {
            id: "building-icons",
            type: "symbol",
            source: "buildings",
            layout: {
              "icon-image": ICON_NAME,
              "icon-size": [
                "interpolate",
                ["linear"],
                ["zoom"],
                10,
                0.5,
                16,
                0.9,
              ],
              "icon-allow-overlap": true,
              "icon-ignore-placement": true,
            },
          },
          map.getLayer("price-grid-outline") ? "price-grid-outline" : undefined
        );
      }

      // Hover card (no click required)
      let hoverPopup: maplibregl.Popup | null = null;
      const buildCardHTML = (p: any) => {
        const price = Number(p.price || 0);
        const floors = Number(p.floors || 0);
        const height = Number(p.height || 0);
        const img = p.image || "/images/placeholder.jpg";
        return `
          <div style="width:260px; font-family: ui-sans-serif,system-ui;">
            <img src="${img}" alt="${
          p.name
        }" style="width:100%; height:128px; object-fit:cover; border-radius:8px;" />
            <div style="margin-top:8px;">
              <div style="font-weight:700; color:#ff5a3c;">${p.name}</div>
              <div style="font-size:12px; color:#9ca3af; margin:2px 0 6px;">${
                p.type
              } · ${floors} floors · ${height} m</div>
              <div style="font-size:14px; margin:2px 0;">Price: <b>${new Intl.NumberFormat(
                "fa-IR"
              ).format(price)}</b> IRR</div>
              <div style="font-size:12px; color:#cbd5e1; margin-top:6px;">${
                p.description
              }</div>
            </div>
          </div>
        `;
      };

      map.on("mouseenter", "building-icons", (e) => {
        if (map.getZoom() < 10) return; // optional: only show hover when sufficiently zoomed
        map.getCanvas().style.cursor = "pointer";
        const f = e.features?.[0];
        if (!f) return;
        const p: any = f.properties;
        const coords = (f.geometry as any).coordinates as [number, number];
        hoverPopup?.remove();
        hoverPopup = new maplibregl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: 10,
        })
          .setLngLat(coords)
          .setHTML(buildCardHTML(p))
          .addTo(map);
      });

      map.on("mousemove", "building-icons", (e) => {
        const f = e.features?.[0];
        if (!f || !hoverPopup) return;
        const coords = (f.geometry as any).coordinates as [number, number];
        hoverPopup.setLngLat(coords);
      });

      map.on("mouseleave", "building-icons", () => {
        map.getCanvas().style.cursor = "";
        hoverPopup?.remove();
        hoverPopup = null;
      });

      // Click to fly/zoom + pin a popup
      map.on("click", "building-icons", (e) => {
        const f = e.features?.[0];
        if (!f) return;
        const p: any = f.properties;
        const coords = (f.geometry as any).coordinates as [number, number];
        map.flyTo({
          center: coords,
          zoom: Math.max(map.getZoom(), 15),
          essential: true,
        });
        new maplibregl.Popup({ offset: 12 })
          .setLngLat(coords)
          .setHTML(buildCardHTML(p))
          .addTo(map);
      });
    };

    map.on("load", async () => {
      upsertPriceGrid();
      await addBuildings();
      onReady?.(map);
    });

    // Update grid when user stops moving/zooming
    map.on("moveend", upsertPriceGrid);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [onReady]);

  // Rebuild the grid when filter mode changes (no reload)
  useEffect(() => {
    const m = mapRef.current;
    if (!m?.isStyleLoaded()) return;
    const b = m.getBounds();
    const bbox: Bbox = {
      west: b.getWest(),
      south: b.getSouth(),
      east: b.getEast(),
      north: b.getNorth(),
    };
    const grid = buildPriceGrid(bbox, 36);
    (m.getSource("price-grid") as any)?.setData(grid);
  }, [mode]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full rounded-lg overflow-hidden"
    />
  );
}
