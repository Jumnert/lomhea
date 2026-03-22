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
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomPinProps {
  category: Category;
  isFeatured?: boolean;
  isSelected?: boolean;
  onClick: () => void;
}

const ICON_BY_CATEGORY = {
  Temple: Church,
  Beach: Umbrella,
  Nature: Trees,
  Waterfall: Waves,
  Market: ShoppingBag,
  Museum: Landmark,
  All: MapPin,
} as const;

const COLOR_BY_CATEGORY = {
  Temple: "bg-amber-500 text-white",
  Beach: "bg-sky-500 text-white",
  Nature: "bg-emerald-500 text-white",
  Waterfall: "bg-cyan-500 text-white",
  Market: "bg-rose-500 text-white",
  Museum: "bg-indigo-500 text-white",
  All: "bg-zinc-600 text-white",
} as const;

export function CustomPin({
  category,
  isFeatured,
  isSelected,
  onClick,
}: CustomPinProps) {
  const Icon = ICON_BY_CATEGORY[category] || MapPin;
  const colorClass = COLOR_BY_CATEGORY[category] || COLOR_BY_CATEGORY.All;

  return (
    <button
      type="button"
      aria-label={`Open ${category} place`}
      className={cn(
        "relative cursor-pointer transition-transform duration-150 will-change-transform",
        isSelected ? "scale-[1.15] z-50" : "z-10 hover:scale-105",
      )}
      onClick={onClick}
    >
      <div
        className={cn(
          "h-9 w-9 rounded-full border-2 border-white flex items-center justify-center shadow-md",
          colorClass,
          isSelected
            ? "ring-2 ring-black/20 dark:ring-white/20"
            : isFeatured
              ? "ring-2 ring-amber-300"
              : "",
        )}
      >
        <Icon size={15} />
      </div>
      {isFeatured && (
        <div className="absolute -top-1.5 -right-1.5 h-4.5 w-4.5 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center border border-white">
          <Star size={9} className="fill-current" />
        </div>
      )}
      <div
        className={cn(
          "absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border-r border-b border-white shadow-sm",
          colorClass,
        )}
      />
    </button>
  );
}
