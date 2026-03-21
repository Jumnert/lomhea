"use client";

import { useMapStore } from "@/stores/mapStore";
import { Badge } from "@/components/ui/badge";
import {
  Church,
  Umbrella,
  Trees,
  Waves,
  ShoppingBag,
  Landmark,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWebHaptics } from "web-haptics/react";

const categories = [
  { id: "All", name: "All", icon: LayoutGrid },
  { id: "Temple", name: "Temple", icon: Church },
  { id: "Beach", name: "Beach", icon: Umbrella },
  { id: "Nature", name: "Nature", icon: Trees },
  { id: "Waterfall", name: "Waterfall", icon: Waves },
  { id: "Market", name: "Market", icon: ShoppingBag },
  { id: "Museum", name: "Museum", icon: Landmark },
];

export function FilterBar() {
  const { category: activeCategory, setCategory } = useMapStore();
  const { trigger } = useWebHaptics();

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-4">
      {categories.map((cat) => {
        const Icon = cat.icon;
        const isActive = activeCategory === cat.id;

        return (
          <Badge
            key={cat.id}
            variant={isActive ? "default" : "secondary"}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95 whitespace-nowrap rounded-full",
              isActive
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-white/20 text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800",
            )}
            onClick={() => {
              trigger(35);
              setCategory(cat.id);
            }}
          >
            <Icon size={14} />
            <span className="text-xs font-medium">{cat.name}</span>
          </Badge>
        );
      })}
    </div>
  );
}
