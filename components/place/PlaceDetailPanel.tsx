"use client";

import { useUIStore } from "@/stores/uiStore";
import { useMapStore } from "@/stores/mapStore";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Place } from "@/types/app";
import {
  Star,
  MapPin,
  Bed,
  Utensils,
  Info,
  ExternalLink,
  Heart,
  Share2,
  ChevronRight,
  Loader2,
  X,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import * as React from "react";
import { ShareDialog } from "@/components/modals/ShareDialog";

export function PlaceDetailPanel() {
  const { isPanelOpen, setPanelOpen, activeTab, setActiveTab } = useUIStore();
  const { selectedPlaceId } = useMapStore();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { setOpen } = useSidebar();
  const [isShareOpen, setIsShareOpen] = React.useState(false);

  React.useEffect(() => {
    setOpen(isPanelOpen);
  }, [isPanelOpen, setOpen]);

  const { data: place, isLoading } = useQuery<Place>({
    queryKey: ["place", selectedPlaceId],
    queryFn: async () => {
      const res = await fetch(`/api/places/${selectedPlaceId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!selectedPlaceId,
  });

  const { data: favorites = [] } = useQuery<string[]>({
    queryKey: ["favorites"],
    queryFn: async () => {
      const res = await fetch("/api/favorites");
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!session,
  });

  const isFavorited = selectedPlaceId
    ? favorites.includes(selectedPlaceId)
    : false;

  const toggleFavorite = useMutation({
    mutationFn: async () => {
      if (!session) {
        toast.error("Please login to save favorites");
        return;
      }
      const res = await fetch("/api/favorites", {
        method: "POST",
        body: JSON.stringify({ placeId: selectedPlaceId }),
        headers: { "Content-Type": "application/json" },
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  return (
    <Sidebar
      side="right"
      collapsible="none"
      className={cn(
        "z-30 border-l border-zinc-200 dark:border-zinc-800 transition-all duration-300 shadow-2xl",
        isPanelOpen
          ? "w-[30vw] opacity-100"
          : "w-0 opacity-0 overflow-hidden border-none",
      )}
    >
      <SidebarContent className="bg-white dark:bg-zinc-950 p-0 gap-0">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : place ? (
          <div className="flex flex-col h-full">
            {/* Header / Gallery */}
            <div className="relative h-72 w-full shrink-0">
              <Image
                src={place.images[0] || "/placeholder-place.jpg"}
                alt={place.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />

              <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full bg-white/20 backdrop-blur-md border-white/20 hover:bg-white/40 text-white"
                  onClick={() => setPanelOpen(false)}
                >
                  <X size={18} />
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    className={cn(
                      "rounded-full backdrop-blur-md transition-all",
                      isFavorited
                        ? "bg-rose-500 text-white border-rose-500 hover:bg-rose-600"
                        : "bg-white/20 border-white/20 text-white hover:bg-white/40",
                    )}
                    onClick={() => toggleFavorite.mutate()}
                    disabled={toggleFavorite.isPending}
                  >
                    {toggleFavorite.isPending ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <Heart
                        size={20}
                        className={cn(isFavorited && "fill-current")}
                      />
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-full bg-white/20 backdrop-blur-md border-white/20 hover:bg-white/40 text-white"
                    onClick={() => setIsShareOpen(true)}
                  >
                    <Share2 size={20} />
                  </Button>
                </div>
              </div>
              {/* Share Dialog — rendered outside the image overlay */}
              {place && (
                <ShareDialog
                  placeName={place.name}
                  placeId={place.id}
                  open={isShareOpen}
                  onOpenChange={setIsShareOpen}
                />
              )}

              <div className="absolute bottom-4 left-6 right-6">
                <Badge
                  variant="outline"
                  className="mb-2 bg-white/10 backdrop-blur-md text-white border-white/20"
                >
                  {place.category}
                </Badge>
                <h2 className="text-2xl font-bold text-white leading-tight">
                  {place.name}
                </h2>
                {place.nameKh && (
                  <p className="text-white/80 font-medium font-khmer text-lg">
                    {place.nameKh}
                  </p>
                )}
              </div>
            </div>

            {/* Stats Bar */}
            <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
              <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                <MapPin size={16} />
                <span className="text-sm font-medium">{place.province}</span>
                <a
                  href={`https://www.google.com/maps?q=${place.lat},${place.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-primary hover:underline flex items-center gap-0.5"
                >
                  <ExternalLink size={12} />
                </a>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md font-bold text-sm">
                  <Star size={14} className="fill-current" />
                  {place.rating.toFixed(1)}
                </div>
                <span className="text-xs text-zinc-400">
                  ({place.reviewCount})
                </span>
              </div>
            </div>

            {/* Content Tabs */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as any)}
                className="w-full flex-1 flex flex-col"
              >
                <div className="px-6 pt-4 shrink-0">
                  <TabsList className="w-full grid grid-cols-3 h-11 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl">
                    <TabsTrigger
                      value="detail"
                      className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm"
                    >
                      <Info size={16} className="mr-2" />
                      About
                    </TabsTrigger>
                    <TabsTrigger
                      value="accommodation"
                      className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm"
                    >
                      <Bed size={16} className="mr-2" />
                      Sleep
                    </TabsTrigger>
                    <TabsTrigger
                      value="food"
                      className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm"
                    >
                      <Utensils size={16} className="mr-2" />
                      Eat
                    </TabsTrigger>
                  </TabsList>
                </div>

                <ScrollArea className="flex-1 px-6 pt-4">
                  <TabsContent value="detail" className="mt-0 pb-6 space-y-6">
                    <section>
                      <h3 className="font-semibold text-zinc-900 dark:text-white mb-2 underline decoration-primary/30 decoration-4 underline-offset-4">
                        Description
                      </h3>
                      <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {place.description}
                      </p>
                    </section>

                    <section>
                      <h3 className="font-semibold text-zinc-900 dark:text-white mb-3">
                        Photos
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {place.images.slice(1).map((img, idx) => (
                          <div
                            key={idx}
                            className="relative aspect-4/3 rounded-lg overflow-hidden group"
                          >
                            <Image
                              src={img}
                              alt={`${place.name} ${idx}`}
                              fill
                              className="object-cover hover:scale-110 transition-transform duration-500 cursor-pointer"
                            />
                          </div>
                        ))}
                      </div>
                    </section>
                  </TabsContent>

                  <TabsContent value="accommodation" className="mt-0 pb-6">
                    <div className="space-y-4">
                      {place.accommodations?.length ? (
                        place.accommodations.map((acc) => (
                          <div
                            key={acc.id}
                            className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:border-primary/50 transition-colors"
                          >
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-bold text-zinc-900 dark:text-white">
                                {acc.name}
                              </h4>
                              <Badge
                                variant="outline"
                                className="text-[10px] uppercase font-bold tracking-wider"
                              >
                                {acc.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                              {acc.priceRange}
                            </p>
                            {acc.bookingUrl && (
                              <Button
                                variant="link"
                                className="h-auto p-0 text-primary text-xs font-semibold"
                                asChild
                              >
                                <a
                                  href={acc.bookingUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Book on Agoda{" "}
                                  <ExternalLink size={10} className="ml-1" />
                                </a>
                              </Button>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 text-zinc-500">
                          No accommodations listed yet.
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="food" className="mt-0 pb-6">
                    <div className="space-y-4">
                      {place.foods?.length ? (
                        place.foods.map((food) => (
                          <div
                            key={food.id}
                            className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:border-primary/50 transition-colors"
                          >
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-bold text-zinc-900 dark:text-white">
                                {food.name}
                              </h4>
                              <Badge
                                variant="outline"
                                className="text-[10px] uppercase font-bold tracking-wider"
                              >
                                {food.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                              {food.priceRange}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 text-zinc-500">
                          No food spots listed yet.
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </div>

            {/* Bottom Review Bar */}
            <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0 mt-auto">
              <Button className="w-full rounded-xl py-6 font-bold text-lg shadow-lg hover:shadow-primary/20 transition-all">
                Write a Review
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6">Error loading place</div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
