"use client";

import { Search } from "lucide-react";

export default function MapSearchBar() {
  return (
    <div className="relative group">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
      <input
        type="text"
        placeholder="Search for places..."
        className="w-full h-11 pl-10 pr-4 rounded-xl border bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}
