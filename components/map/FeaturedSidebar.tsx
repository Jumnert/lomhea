"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import {
  Star,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useMapStore } from "@/stores/mapStore";
import { useUIStore } from "@/stores/uiStore";
import { Place } from "@/types/app";
import { cn } from "@/lib/utils";

export function FeaturedSidebar() {
  const { setSelectedPlaceId } = useMapStore();
  const { setPanelOpen } = useUIStore();
  const [collapsed, setCollapsed] = useState(false);

  const { data: places = [] } = useQuery<Place[]>({
    queryKey: ["places"],
    queryFn: async () => {
      const res = await fetch("/api/places");
      if (!res.ok) throw new Error("Failed to fetch places");
      return res.json();
    },
    staleTime: 30000,
  });

  const featured = useMemo(() => {
    const now = Date.now();
    return places
      .filter((p) => {
        if (!p.isFeatured) return false;
        if (!p.featuredUntil) return true;
        return new Date(p.featuredUntil).getTime() > now;
      })
      .slice(0, 6);
  }, [places]);

  if (!featured.length) return null;

  return (
    <aside
      className={cn(
        "hidden md:block absolute top-[130px] z-20 pointer-events-auto",
        "transition-all duration-300 ease-out",
        collapsed ? "left-0 w-9" : "left-4 w-[320px]",
      )}
    >
      <div className="relative border border-zinc-200/80 dark:border-zinc-700 bg-white/90 dark:bg-zinc-900/85 backdrop-blur-xl shadow-xl overflow-hidden rounded-lg">
        {collapsed ? (
          <div className="h-16 rounded-r-lg bg-white/95 dark:bg-zinc-900/95 shadow-lg">
            <button
              onClick={() => setCollapsed(false)}
              className="h-full w-full rounded-r-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center"
              aria-label="Expand highlights"
              title="Expand highlights"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        ) : (
          <div className="h-[68vh] flex flex-col">
            <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-linear-to-r from-amber-50 to-white dark:from-amber-500/10 dark:to-zinc-900">
              <p className="text-[13px] font-medium text-amber-700 dark:text-amber-300 flex items-center gap-2">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                Featured places
              </p>
            </div>

            <button
              onClick={() => setCollapsed(true)}
              className="absolute right-0 top-1/2 -translate-y-1/2 h-12 w-6 rounded-l-md border border-r-0 border-zinc-200 dark:border-zinc-700 bg-white/95 dark:bg-zinc-900/95 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center"
              aria-label="Collapse highlights"
              title="Collapse highlights"
            >
              <ChevronLeft size={14} />
            </button>

            <div className="max-h-[64vh] overflow-y-auto p-2 space-y-2">
              {featured.map((place) => (
                <button
                  key={place.id}
                  onClick={() => {
                    setSelectedPlaceId(place.id);
                    setPanelOpen(true);
                  }}
                  className={cn(
                    "w-full text-left rounded-xl p-2 border border-zinc-100 dark:border-zinc-800",
                    "hover:border-amber-300 dark:hover:border-amber-500/40 hover:bg-amber-50/50 dark:hover:bg-amber-500/5 transition-all",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                      <Image
                        src={place.images[0] || "/placeholder.jpg"}
                        alt={place.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                          Featured
                        </span>
                      </div>
                      <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                        {place.name}
                      </p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1 truncate">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {place.province}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
