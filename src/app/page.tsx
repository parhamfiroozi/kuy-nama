"use client";

import { useRef } from "react";
import type maplibregl from "maplibre-gl";
import MapView from "./components/Map";
import SearchBox from "./components/SearchBox";
import PillNav from "./components/PillNav";

export default function Page() {
  const mapRef = useRef<maplibregl.Map | null>(null);

  return (
    <main className="h-screen relative">
      {/* optional: your pill nav */}
      <div className="absolute top-3 left-3 z-50">
        <PillNav
          items={[
            { label: "خانه", href: "/" },
            { label: "فروش", href: "/?mode=sale" },
            { label: "اجاره", href: "/?mode=rent" },
          ]}
          activeHref="/"
          className=""
          ease="power2.easeOut"
          baseColor="#000"
          pillColor="#fff"
          hoveredPillTextColor="#fff"
          pillTextColor="#000"
        />
      </div>

      {/* search box floating over the map */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50">
        <SearchBox map={mapRef.current} />
      </div>

      {/* the map */}
      <div className="absolute inset-0">
        <MapView onReady={(m) => (mapRef.current = m)} />
      </div>
    </main>
  );
}
