"use client";

import type { Building } from "@/data/buildings";

export default function BuildingList({
  items,
  selectedId,
  onSelect,
}: {
  items: Building[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}) {
  return (
    <div
      dir="rtl"
      className="absolute left-4 bottom-4 z-40 max-w-[60vw] w-[540px]"
    >
      <div className="rounded-2xl bg-[#0b1220]/80 backdrop-blur border border-[#8cb2b2]/30 shadow-xl p-2">
        <div className="max-h-64 overflow-auto space-y-2">
          {items.map((b) => {
            const active = b.id === selectedId;
            return (
              <button
                key={b.id}
                onClick={() => onSelect?.(b.id)}
                className={`w-full text-right grid grid-cols-[64px,1fr,auto] gap-3 items-center p-2 rounded-xl border ${
                  active
                    ? "border-[#ff5a3c] bg-[#0e1628]"
                    : "border-white/10 hover:bg-white/5"
                }`}
              >
                <img
                  src={b.image ?? "/images/placeholder.jpg"}
                  alt={b.name}
                  className="w-16 h-12 rounded-lg object-cover"
                />
                <div>
                  <div className="text-white text-sm font-semibold truncate">
                    {b.name}
                  </div>
                  <div className="text-[#9ca3af] text-xs">{b.agency}</div>
                </div>
                <div className="text-[#ff5a3c] text-sm font-bold">
                  {new Intl.NumberFormat("fa-IR").format(b.price)}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
