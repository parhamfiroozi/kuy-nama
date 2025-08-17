"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import type { Map as MLMap } from "maplibre-gl";

export default function MapView({
  onReady,
}: {
  onReady?: (map: MLMap) => void;
}) {
  const mapRef = useRef<MLMap | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const STYLE_URL = "/style/kuy-nama.json";
  const ICON_NAME = "building-logo";
  const ICON_URL = "/images/building-pin.png";

  // Hide dark base polygons (buildings / landuse / landcover etc), keep water
  const hideBasePolygons = (map: MLMap) => {
    const style = map.getStyle();
    if (!style?.layers) return;

    // keywords we want to hide if layer type is "fill"
    const HIDE_KEYS = [
      "building",
      "landuse",
      "landcover",
      "park",
      "wood",
      "forest",
      "aeroway",
      "pedestrian",
      "residential",
      "commercial",
      "industrial",
      "school",
      "university",
      "hospital",
      "place",
      "amenity",
    ];

    // keywords we should not hide
    const KEEP_KEYS = ["water", "background"];

    for (const layer of style.layers) {
      // only target polygon fills in the basemap
      if (layer.type !== "fill") continue;

      const id = layer.id.toLowerCase();
      if (KEEP_KEYS.some((k) => id.includes(k))) continue;

      if (HIDE_KEYS.some((k) => id.includes(k))) {
        try {
          map.setLayoutProperty(layer.id, "visibility", "none");
        } catch {
          // ignore
        }
      }
    }
  };

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: [52.5837, 29.5918], // Shiraz
      zoom: 12,
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

    const addBuildings = async () => {
      if (!map.getSource("buildings")) {
      }

      // Load custom pin image once
      await new Promise<void>((resolve, reject) => {
        if (map.hasImage(ICON_NAME)) return resolve();
        (map as any).loadImage(ICON_URL, (err: any, img: any) => {
          if (err) return reject(err);
          if (!map.hasImage(ICON_NAME)) map.addImage(ICON_NAME, img);
          resolve();
        });
      });

      if (!map.getLayer("building-icons")) {
        map.addLayer({
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
          },
        });
      }

      // Hover card
      let hoverPopup: maplibregl.Popup | null = null;
      const buildCardHTML = (p: any) => {
        const price = Number(p.price || 0);
        const floors = Number(p.floors || 0);
        const height = Number(p.height || 0);
        const img = p.image || "/images/placeholder.jpg";
        return `
          <div style="width:260px; font-family: ui-sans-serif,system-ui;">
            <img src="${img}" alt="${p.name}"
                 style="width:100%; height:128px; object-fit:cover; border-radius:8px;" />
            <div style="margin-top:8px;">
              <div style="font-weight:700; color:#ff5a3c;">${p.name}</div>
              <div style="font-size:12px; color:#9ca3af; margin:2px 0 6px;">
                ${p.type} · ${floors} floors · ${height} m
              </div>
              <div style="font-size:14px; margin:2px 0;">
                Price: <b>${new Intl.NumberFormat("fa-IR").format(
                  price
                )}</b> IRR
              </div>
              <div style="font-size:12px; color:#cbd5e1; margin-top:6px;">
                ${p.description}
              </div>
            </div>
          </div>
        `;
      };

      map.on("mouseenter", "building-icons", (e) => {
        if (map.getZoom() < 10) return;
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

    // Hide polygons after style is ready; run on load and also on style reloads
    map.on("load", async () => {
      hideBasePolygons(map);
      await addBuildings();
      onReady?.(map);
    });
    map.on("styledata", () => {
      // If the style is reloaded (e.g. style switch), apply again
      hideBasePolygons(map);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [onReady]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full rounded-lg overflow-hidden"
    />
  );
}
