"use client";

import { useState, useRef, useEffect } from "react";
import { useMapStore } from "@/stores/mapStore";
import { useUIStore } from "@/stores/uiStore";
import { useQueryClient } from "@tanstack/react-query";
import { Place } from "@/types/app";
import { Search, X, MapPin } from "lucide-react";

export function MapSearchBar() {
  const { searchQuery, setSearchQuery, setSelectedPlaceId, setViewState } =
    useMapStore();
  const { setPanelOpen } = useUIStore();
  const queryClient = useQueryClient();

  const [inputValue, setInputValue] = useState(searchQuery);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get suggestions from the cached places (no extra fetch)
  const allPlaces = queryClient.getQueryData<Place[]>(["places"]) ?? [];
  const suggestions =
    inputValue.trim().length === 0
      ? []
      : allPlaces
          .filter((p) => {
            const q = inputValue.toLowerCase();
            return (
              p.name.toLowerCase().includes(q) ||
              p.nameKh?.toLowerCase().includes(q) ||
              p.province.toLowerCase().includes(q) ||
              p.category.toLowerCase().includes(q)
            );
          })
          .slice(0, 8);

  // Sync external searchQuery changes → input
  useEffect(() => {
    if (searchQuery === "") setInputValue("");
  }, [searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleChange = (val: string) => {
    setInputValue(val);
    setSearchQuery(val);
    setIsOpen(true);
    setActiveIndex(-1);
  };

  const handleSelect = (place: Place) => {
    setInputValue(place.name);
    setSearchQuery(place.name);
    setIsOpen(false);
    setActiveIndex(-1);
    setSelectedPlaceId(place.id);
    setPanelOpen(true);
    setViewState({ latitude: place.lat, longitude: place.lng, zoom: 14 });
  };

  const handleClear = () => {
    setInputValue("");
    setSearchQuery("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const highlight = (text: string, query: string) => {
    if (!query.trim()) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span className="font-black text-foreground">
          {text.slice(idx, idx + query.length)}
        </span>
        {text.slice(idx + query.length)}
      </>
    );
  };

  return (
    <div ref={containerRef} className="relative group w-full">
      {/* Input */}
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none z-10" />
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => inputValue && setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search places, provinces..."
        className="w-full h-10 pl-9 pr-8 rounded-xl bg-background/95 backdrop-blur-sm shadow-sm border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
      />
      {inputValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10"
        >
          <X size={14} />
        </button>
      )}

      {/* Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-50 bg-background/95 backdrop-blur-md border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {suggestions.map((place, i) => (
            <button
              key={place.id}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(place);
              }}
              onMouseEnter={() => setActiveIndex(i)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                activeIndex === i
                  ? "bg-primary/10 text-foreground"
                  : "hover:bg-muted/60 text-foreground"
              }`}
            >
              <MapPin size={14} className="shrink-0 text-primary opacity-70" />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate text-muted-foreground font-medium">
                  {highlight(place.name, inputValue)}
                </p>
                <p className="text-[10px] text-muted-foreground/60 truncate">
                  {place.province} · {place.category}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default MapSearchBar;
