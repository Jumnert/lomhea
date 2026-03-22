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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMapStore } from "@/stores/mapStore";
import { useUIStore } from "@/stores/uiStore";
import { Place } from "@/types/app";
import { CustomPin } from "./CustomPin";
import { LomheaLoader } from "@/components/ui/LomheaLoader";
import { useTheme } from "next-themes";
import { useWebHaptics } from "web-haptics/react";
import { pusherClient } from "@/lib/pusher-client";

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
  const { trigger } = useWebHaptics();
  const queryClient = useQueryClient();

  // Auto-refresh map when a place is approved or added (via Pusher)
  React.useEffect(() => {
    const channel = pusherClient.subscribe("places");
    channel.bind("places-updated", () => {
      queryClient.invalidateQueries({ queryKey: ["places"] });
    });
    return () => {
      pusherClient.unsubscribe("places");
    };
  }, [queryClient]);

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
    queryKey: ["places"],
    queryFn: async () => {
      const res = await fetch("/api/places");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 60, // 1 hour
  });

  const mapRef = React.useRef<MapRef>(null);

  const onMarkerClick = (place: Place) => {
    trigger(20);
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

    let result = places;

    // Filter by category locally
    if (category !== "All") {
      result = result.filter((p) => p.category === category);
    }

    // Filter by search query locally
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (place) =>
          place.name.toLowerCase().includes(query) ||
          place.nameKh?.toLowerCase().includes(query) ||
          place.category.toLowerCase().includes(query) ||
          place.province.toLowerCase().includes(query),
      );
    }

    // Final safety check: Filter out markers with invalid coordinates to prevent MapLibre crash
    result = result.filter((p) => {
      const isLatValid = p.lat >= -90 && p.lat <= 90;
      const isLngValid = p.lng >= -180 && p.lng <= 180;
      if (!isLatValid || !isLngValid) {
        return false;
      }
      return true;
    });

    return result;
  }, [places, category, searchQuery]);

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
        antialias={true}
        {...({
          dragPan: {
            inertia: 300,
            easing: (t: number) => t * (2 - t),
          },
          scrollZoom: {
            smoothness: 0.15,
          },
        } as any)}
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
