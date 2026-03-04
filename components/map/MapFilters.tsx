"use client";

const categories = [
  "All",
  "Temple",
  "Waterfall",
  "Beach",
  "Mountain",
  "Resort",
  "Cafe",
];

export default function MapFilters() {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
      {categories.map((cat) => (
        <button
          key={cat}
          className="px-4 py-1.5 rounded-full bg-white border text-sm font-medium whitespace-nowrap shadow-sm hover:bg-zinc-50 transition-colors"
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
