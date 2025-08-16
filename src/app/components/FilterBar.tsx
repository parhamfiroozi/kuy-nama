"use client";

type Mode = "all" | "sale" | "rent";
type Sort = "price-asc" | "price-desc" | "newest" | "oldest";

export default function FilterBar(props: {
  mode: Mode;
  sort: Sort;
  onChange: (v: Partial<{ mode: Mode; sort: Sort }>) => void;
}) {
  const { mode, sort, onChange } = props;

  const Seg = ({
    items,
    value,
    onPick,
    ariaLabel,
  }: {
    items: { key: string; label: string }[];
    value: string;
    onPick: (k: string) => void;
    ariaLabel: string;
  }) => (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="inline-flex rounded-full border border-[color:var(--mint)]/40 bg-neutral-900/60 overflow-hidden"
    >
      {items.map((it, i) => {
        const active = it.key === value;
        return (
          <button
            key={it.key}
            role="tab"
            aria-selected={active}
            onClick={() => onPick(it.key)}
            className={[
              "px-3 sm:px-4 py-2 text-sm transition",
              active
                ? "bg-[color:var(--brand)] text-black"
                : "text-neutral-300 hover:bg-neutral-800/70",
              i !== 0 ? "border-l border-[color:var(--mint)]/30" : "",
            ].join(" ")}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="w-full flex flex-wrap items-center gap-3">
      <Seg
        ariaLabel="Listing type"
        value={mode}
        onPick={(k) => onChange({ mode: k as Mode })}
        items={[
          { key: "all", label: "All" },
          { key: "sale", label: "For sale" },
          { key: "rent", label: "For rent" },
        ]}
      />
      <Seg
        ariaLabel="Sort by"
        value={sort}
        onPick={(k) => onChange({ sort: k as Sort })}
        items={[
          { key: "price-asc", label: "Price ↑" },
          { key: "price-desc", label: "Price ↓" },
          { key: "newest", label: "Newest" },
          { key: "oldest", label: "Oldest" },
        ]}
      />
    </div>
  );
}
