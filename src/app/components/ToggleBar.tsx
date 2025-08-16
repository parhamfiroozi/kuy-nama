"use client";

export default function ToggleBar(props: {
  sale: boolean;
  rent: boolean;
  heatmap: boolean;
  onChange: (
    val: Partial<{ sale: boolean; rent: boolean; heatmap: boolean }>
  ) => void;
}) {
  const { sale, rent, heatmap, onChange } = props;
  return (
    <div className="flex items-center gap-4 text-sm">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={sale}
          onChange={(e) => onChange({ sale: e.target.checked })}
        />
        <span>For sale</span>
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={rent}
          onChange={(e) => onChange({ rent: e.target.checked })}
        />
        <span>For rent</span>
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={heatmap}
          onChange={(e) => onChange({ heatmap: e.target.checked })}
        />
        <span>Heatmap</span>
      </label>
    </div>
  );
}
