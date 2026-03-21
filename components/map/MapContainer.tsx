"use client";

import * as React from "react";
import Map, {
  Marker,
  NavigationControl,
  AttributionControl,
  ViewStateChangeEvent,
  MapRef,
} from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useQuery } from "@tanstack/react-query";
import { useMapStore } from "@/stores/mapStore";
import { useUIStore } from "@/stores/uiStore";
import { Place } from "@/types/app";
import { CustomPin } from "./CustomPin";
import { LomheaLoader } from "@/components/ui/LomheaLoader";
import { useTheme } from "next-themes";

export function MapContainer() {
  const {
    category,
    viewState,
    setViewState,
    selectedPlaceId,
    setSelectedPlaceId,
    searchQuery,
  } = useMapStore();
  const { setPanelOpen } = useUIStore();
  const { resolvedTheme } = useTheme();

  // Switches between light/dark map style based on app theme
  const MAP_STYLE =
    resolvedTheme === "dark"
      ? "https://tiles.openfreemap.org/styles/dark"
      : "https://tiles.openfreemap.org/styles/positron";

  // Cambodia bounds: [minLng, minLat, maxLng, maxLat]
  const CAMBODIA_BOUNDS: [number, number, number, number] = [
    102.333, 9.914, 107.627, 14.69,
  ];

  const { data: places, isLoading } = useQuery<Place[]>({
    queryKey: ["places", category],
    queryFn: async () => {
      const res = await fetch(
        `/api/places${category !== "All" ? `?category=${category}` : ""}`,
      );
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  const mapRef = React.useRef<MapRef>(null);

  const onMarkerClick = (place: Place) => {
    setSelectedPlaceId(place.id);
    setPanelOpen(true);

    mapRef.current?.flyTo({
      center: [place.lng, place.lat],
      zoom: 14,
      duration: 2000,
      essential: true,
    });
  };

  const filteredPlaces = React.useMemo(() => {
    if (!places) return [];
    if (!searchQuery) return places;

    const query = searchQuery.toLowerCase();
    return places.filter(
      (place) =>
        place.name.toLowerCase().includes(query) ||
        place.nameKh?.toLowerCase().includes(query) ||
        place.category.toLowerCase().includes(query) ||
        place.province.toLowerCase().includes(query),
    );
  }, [places, searchQuery]);

  if (isLoading) {
    return (
      <div className="w-full h-full relative flex flex-col items-center justify-center bg-white dark:bg-zinc-950 overflow-hidden">
        {/* Decorative background blurs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-amber-500/5 rounded-full blur-[100px]" />

        <LomheaLoader />
        <p className="mt-12 text-[10px] font-black tracking-[0.5em] text-zinc-400 dark:text-zinc-600 animate-pulse uppercase italic">
          Discovering Cambodia
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <Map
        {...viewState}
        ref={mapRef}
        onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
        mapLib={maplibregl}
        mapStyle={MAP_STYLE}
        attributionControl={false}
        style={{ width: "100%", height: "100%" }}
        maxBounds={CAMBODIA_BOUNDS}
        minZoom={6}
        maxZoom={18}
        reuseMaps
        boxZoom={false}
        onLoad={(e) => {
          const map = e.target;
          map.on("styleimagemissing", (e) => {
            console.warn(`Map style image missing: ${e.id}`);
            // We can add a fallback empty image here if needed to stop the error
          });
        }}
      >
        <NavigationControl position="bottom-right" />
        <AttributionControl position="bottom-left" />

        {filteredPlaces.map((place) => (
          <Marker
            key={place.id}
            latitude={place.lat}
            longitude={place.lng}
            anchor="bottom"
          >
            <CustomPin
              category={place.category}
              isSelected={selectedPlaceId === place.id}
              onClick={() => onMarkerClick(place)}
            />
          </Marker>
        ))}
      </Map>
    </div>
  );
}
