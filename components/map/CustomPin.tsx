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
  Temple: "text-amber-600",
  Beach: "text-sky-600",
  Nature: "text-emerald-600",
  Waterfall: "text-cyan-600",
  Market: "text-rose-600",
  Museum: "text-indigo-600",
  All: "text-zinc-600",
} as const;

export function CustomPin({
  category,
  isFeatured,
  isSelected,
  onClick,
}: CustomPinProps) {
  const Icon = ICON_BY_CATEGORY[category] || MapPin;
  const iconColorClass = COLOR_BY_CATEGORY[category] || COLOR_BY_CATEGORY.All;

  return (
    <button
      type="button"
      aria-label={`Open ${category} place`}
      className={cn(
        "group relative cursor-pointer transition-transform duration-150 will-change-transform",
        isSelected ? "scale-[1.12] z-50" : "z-10 hover:scale-105",
      )}
      onClick={onClick}
    >
      <div
        className={cn(
          "relative h-9 w-9 rounded-full border-2 flex items-center justify-center shadow-md",
          isFeatured
            ? "bg-gradient-to-b from-amber-200 via-amber-300 to-amber-500 border-amber-50 text-amber-950 shadow-amber-900/25"
            : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700",
          isSelected
            ? "ring-2 ring-black/20 dark:ring-white/20"
            : "",
        )}
      >
        <Icon
          size={15}
          className={cn(
            isFeatured ? "text-amber-950" : iconColorClass,
          )}
        />
        {!isFeatured && (
          <div className="absolute -bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full border border-white dark:border-zinc-900 bg-emerald-500" />
        )}
      </div>
      {isFeatured && (
        <>
          <div className="absolute -inset-1 rounded-full border border-amber-300/80" />
          <div className="absolute -top-1.5 -right-1.5 h-4.5 w-4.5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center border border-amber-300 shadow-sm">
            <Star size={9} className="fill-current" strokeWidth={2.5} />
          </div>
        </>
      )}
      <div
        className={cn(
          "absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 shadow-sm border-r border-b",
          isFeatured
            ? "bg-amber-500 border-amber-100"
            : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700",
        )}
      />
    </button>
  );
}
