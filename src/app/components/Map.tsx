"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import type { Map as MLMap } from "maplibre-gl";
// Assuming these imports are correct
// import { listingsGeoJSON } from "@/data/listings";
// import { buildingsGeoJSON } from "@/data/buildings";

type Mode = "all" | "sale" | "rent";

export default function MapView({
  mode = "all", // mode is now unused inside the main effect but kept for potential future use
  onReady,
}: {
  mode?: Mode;
  onReady?: (map: MLMap) => void;
}) {
  const mapRef = useRef<MLMap | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  const STYLE_URL = "/style/kuy-nama.json";

  // This effect initializes the map ONCE.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return; // Prevents re-initialization

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

    // ✅ Click to drop pin logic
    map.on("click", (e) => {
      const { lng, lat } = e.lngLat;

      // Remove the previous marker if it exists
      markerRef.current?.remove();

      // Create a more robust custom marker element
      const el = document.createElement("div");
      el.className = "custom-marker"; // Use a class for easier styling
      el.style.backgroundImage = "url('/images/building-pin.png')";
      el.style.width = "48px";
      el.style.height = "48px";
      el.style.backgroundSize = "contain";
      el.style.backgroundRepeat = "no-repeat";
      // Add a fallback style for debugging in case the image doesn't load
      el.style.backgroundColor = "rgba(255, 0, 0, 0.2)";
      el.style.borderRadius = "50%";

      // Drop marker with anchor at the bottom so the tip points to the clicked spot
      markerRef.current = new maplibregl.Marker({
        element: el,
        anchor: "bottom", // This aligns the bottom-center of the div to the coordinate
      })
        .setLngLat([lng, lat])
        .addTo(map);

      console.log("📍 Pin dropped at", lng, lat);
    });

    map.on("load", () => {
      // Safely call onReady callback
      if (onReady) {
        onReady(map);
      }
    });

    // Cleanup function to remove the map instance when the component unmounts
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [onReady]); // <--- Key change: Removed 'mode' from dependencies

  // You can use a separate useEffect to handle changes to the 'mode' prop
  // This prevents the entire map from being re-created
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    console.log("Map mode changed to:", mode);
    // Add logic here to filter data or change layers based on the mode
    // For example:
    // map.setFilter('listings-layer', ['==', 'type', mode]);
  }, [mode]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full rounded-lg overflow-hidden"
    />
  );
}
