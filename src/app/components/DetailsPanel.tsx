"use client";

import type { Building } from "@/data/buildings";

export default function DetailsPanel({
  item,
  onClose,
}: {
  item: Building | null;
  onClose?: () => void;
}) {
  return (
    <aside
      dir="rtl"
      className="fixed right-0 top-0 h-screen w-[360px] max-w-[92vw] bg-[#0b1220]/95 backdrop-blur text-white shadow-2xl border-l border-[#8cb2b2]/30 z-50"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h3 className="font-bold">{item ? item.name : "جزئیات ملک"}</h3>
        <button
          className="text-sm opacity-80 hover:opacity-100"
          onClick={onClose}
        >
          بستن
        </button>
      </div>

      {item ? (
        <div className="p-4 space-y-3">
          <div className="aspect-video w-full overflow-hidden rounded-lg bg-[#0e1628]">
            <img
              src={item.image ?? "/images/placeholder.jpg"}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="text-sm text-[#9ca3af]">
            {item.description ?? "—"}
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border border-white/10 p-3">
              <div className="text-[#cbd5e1]">آژانس</div>
              <div className="font-semibold">{item.agency}</div>
            </div>
            <div className="rounded-lg border border-white/10 p-3">
              <div className="text-[#cbd5e1]">نوع</div>
              <div className="font-semibold">
                {item.type === "sale" ? "فروش" : "اجاره"}
              </div>
            </div>
            <div className="rounded-lg border border-white/10 p-3">
              <div className="text-[#cbd5e1]">متراژ</div>
              <div className="font-semibold">{item.area_m2} متر</div>
            </div>
            <div className="rounded-lg border border-white/10 p-3">
              <div className="text-[#cbd5e1]">اتاق/حمام</div>
              <div className="font-semibold">
                {item.beds} / {item.baths}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[#ff5a3c] p-3">
            <div className="text-[#ffb3a6] text-sm">قیمت</div>
            <div className="text-xl font-bold text-[#ff5a3c]">
              {new Intl.NumberFormat("fa-IR").format(item.price)}{" "}
              <span className="text-sm">﷼</span>
            </div>
          </div>

          <div className="pt-2">
            <a
              href={`https://www.openstreetmap.org/?mlat=${item.coords[1]}&mlon=${item.coords[0]}#map=17/${item.coords[1]}/${item.coords[0]}`}
              target="_blank"
              className="inline-block text-xs text-[#8cb2b2] hover:underline"
              rel="noreferrer"
            >
              مشاهده در نقشه (OSM)
            </a>
          </div>
        </div>
      ) : (
        <div className="p-4 text-sm text-[#9ca3af]">
          یک ملک از روی نقشه یا لیست انتخاب کنید.
        </div>
      )}
    </aside>
  );
}
