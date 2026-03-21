"use client";

import { MapContainer } from "@/components/map/MapContainer";
import { FilterBar } from "@/components/map/FilterBar";
import { Navbar } from "@/components/layout/Navbar";
import { PlaceDetailCard } from "@/components/place/PlaceDetailCard";
import { MapSearchBar } from "@/components/map/MapSearchBar";

export function ExplorePage() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {/* Header / Nav */}
      <Navbar />

      {/* Main Map View */}
      <main className="w-full h-full relative z-0">
        <MapContainer />
      </main>

      {/* Floating Filters + Search - right below navbar */}
      <div className="absolute top-[72px] left-0 right-0 z-20 pointer-events-none">
        <div className="pointer-events-auto px-4 pt-2 pb-1">
          {/* Search Bar */}
          <div className="max-w-sm mx-auto mb-2">
            <MapSearchBar />
          </div>
          {/* Category filters */}
          <FilterBar />
        </div>
      </div>

      {/* Floating Place Detail Card */}
      <div className="z-30">
        <PlaceDetailCard />
      </div>
    </div>
  );
}
