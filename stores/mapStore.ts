import { create } from "zustand";

interface MapState {
  selectedPlaceId: string | null;
  setSelectedPlaceId: (id: string | null) => void;
  category: string;
  setCategory: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewState: {
    latitude: number;
    longitude: number;
    zoom: number;
  };
  setViewState: (viewState: {
    latitude: number;
    longitude: number;
    zoom: number;
  }) => void;
}

export const useMapStore = create<MapState>((set) => ({
  selectedPlaceId: null,
  setSelectedPlaceId: (id) => set({ selectedPlaceId: id }),
  category: "All",
  setCategory: (category) => set({ category }),
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
  viewState: {
    latitude: 12.5657, // Center of Cambodia
    longitude: 104.991,
    zoom: 7,
  },
  setViewState: (viewState) => set({ viewState }),
}));
