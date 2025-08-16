"use client";
import { useState } from "react";

export default function SearchBox({
  onFly,
}: {
  onFly: (lng: number, lat: number) => void;
}) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<
    { name: string; lon: number; lat: number }[]
  >([]);

  async function doSearch(e?: React.FormEvent) {
    e?.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
      if (!r.ok) {
        setList([]);
        return;
      }
      const ct = r.headers.get("content-type") || "";
      const data = ct.includes("application/json")
        ? await r.json()
        : { results: [] };
      const { results } = data;
      setList(results || []);
      if (results?.[0]) onFly(results[0].lon, results[0].lat);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-lg">
      <form onSubmit={doSearch} className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search a place…"
          className="w-full rounded bg-neutral-800/80 border border-neutral-700 px-3 py-2 outline-none focus:ring-2 ring-indigo-500"
        />
        <button
          disabled={loading}
          className="px-3 py-2 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60"
        >
          {loading ? "…" : "Go"}
        </button>
      </form>
      {list.length > 0 && (
        <ul className="mt-2 space-y-1 text-sm text-neutral-300 max-h-48 overflow-auto">
          {list.map((r, i) => (
            <li key={i} className="truncate">
              <button
                className="hover:underline"
                onClick={() => onFly(r.lon, r.lat)}
                title={`${r.lat},${r.lon}`}
              >
                {r.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
