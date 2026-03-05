"use client";

import { Category } from "@/types/app";
import {
  Church,
  Umbrella,
  Trees,
  Waves,
  ShoppingBag,
  Landmark,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomPinProps {
  category: Category;
  isSelected?: boolean;
  onClick: () => void;
}

export function CustomPin({ category, isSelected, onClick }: CustomPinProps) {
  const getIcon = () => {
    switch (category) {
      case "Temple":
        return Church;
      case "Beach":
        return Umbrella;
      case "Nature":
        return Trees;
      case "Waterfall":
        return Waves;
      case "Market":
        return ShoppingBag;
      case "Museum":
        return Landmark;
      default:
        return MapPin;
    }
  };

  const Icon = getIcon();

  const getColors = () => {
    switch (category) {
      case "Temple":
        return "bg-amber-500 text-white";
      case "Beach":
        return "bg-blue-400 text-white";
      case "Nature":
        return "bg-emerald-500 text-white";
      case "Waterfall":
        return "bg-cyan-500 text-white";
      case "Market":
        return "bg-rose-500 text-white";
      case "Museum":
        return "bg-indigo-500 text-white";
      default:
        return "bg-zinc-500 text-white";
    }
  };

  return (
    <div
      className={cn(
        "relative flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110",
        isSelected ? "scale-125 z-50" : "z-10",
      )}
      onClick={onClick}
    >
      <div
        className={cn(
          "p-2 rounded-full shadow-lg border-2 border-white transition-all transform",
          getColors(),
          isSelected ? "ring-4 ring-primary/30" : "",
        )}
      >
        <Icon size={18} />
      </div>
      {/* Little tail for the pin */}
      <div
        className={cn(
          "absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border-r border-b border-white",
          getColors(),
        )}
      />
    </div>
  );
}
