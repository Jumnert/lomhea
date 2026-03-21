"use client";

import { useMapStore } from "@/stores/mapStore";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

export function MapSearchBar() {
  const { searchQuery, setSearchQuery } = useMapStore();

  return (
    <div className="relative group">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
      <Input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search places, provinces..."
        className="w-full h-10 pl-9 pr-8 rounded-xl bg-background/95 backdrop-blur-sm shadow-sm border"
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

export default MapSearchBar;
