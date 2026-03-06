"use client";

import {
  Star,
  MapPin,
  Share2,
  Heart,
  ExternalLink,
  X,
  Loader2,
  LogIn,
  Bed,
  UtensilsCrossed,
  Navigation,
  Info,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Expandable,
  ExpandableCard,
  ExpandableCardContent,
  ExpandableCardFooter,
  ExpandableCardHeader,
  ExpandableContent,
  ExpandableTrigger,
} from "@/components/ui/expandable";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useUIStore } from "@/stores/uiStore";
import { useMapStore } from "@/stores/mapStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Place } from "@/types/app";
import Image from "next/image";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShareDialog } from "@/components/modals/ShareDialog";

// Inner component that safely uses hooks and receives expanded state
function CardInner({
  isExpanded,
  toggleExpand,
}: {
  isExpanded: boolean;
  toggleExpand: () => void;
}) {
  const { isPanelOpen, activeTab, setActiveTab } = useUIStore();
  const { selectedPlaceId } = useMapStore();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isContentReady, setIsContentReady] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  useEffect(() => {
    if (isExpanded) {
      const timer = setTimeout(() => setIsContentReady(true), 160);
      return () => clearTimeout(timer);
    } else {
      setIsContentReady(false);
    }
  }, [isExpanded]);

  const { data: place } = useQuery<Place>({
    queryKey: ["place", selectedPlaceId],
    queryFn: async () => {
      const res = await fetch(`/api/places/${selectedPlaceId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!selectedPlaceId && isPanelOpen,
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

  const triggerLoginAlert = () => {
    if (isExpanded) toggleExpand();
    setShowLoginAlert(true);
  };

  const toggleFavorite = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/favorites", {
        method: "POST",
        body: JSON.stringify({ placeId: selectedPlaceId }),
        headers: { "Content-Type": "application/json" },
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      toast.success(
        isFavorited ? "Removed from favorites" : "Added to favorites! ❤️",
      );
    },
  });

  const handleShare = () => {
    setIsShareOpen(true);
    if (isExpanded) toggleExpand();
  };

  return (
    <>
      <ExpandableCard
        className={cn(
          "overflow-hidden transition-shadow duration-500",
          "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-2xl",
        )}
        collapsedSize={{ width: 340, height: 110 }}
        expandedSize={{ width: 520, height: 560 }}
      >
        <div className="relative h-full w-full flex flex-col">
          {/* ── COLLAPSED VIEW ── */}
          {!isExpanded && (
            <ExpandableTrigger className="h-full">
              <div className="flex gap-3.5 p-3 h-full items-center">
                <div className="relative w-[72px] h-[72px] rounded-xl overflow-hidden shrink-0 border border-zinc-100 dark:border-zinc-800">
                  {place ? (
                    <Image
                      src={place.images[0] || "/placeholder.jpg"}
                      alt={place.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <Skeleton className="w-full h-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0 py-1">
                  {place ? (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="secondary"
                          className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-px rounded-md bg-primary/10 text-primary border-0"
                        >
                          {place.category}
                        </Badge>
                        <span className="flex items-center gap-0.5 text-amber-500 text-[11px] font-bold ml-auto pr-6">
                          <Star size={10} className="fill-current" />
                          {place.rating.toFixed(1)}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-zinc-900 dark:text-white truncate">
                        {place.name}
                      </h3>
                      <div className="flex items-center gap-1 text-zinc-400 text-[11px] mt-0.5">
                        <MapPin size={10} className="text-primary shrink-0" />
                        <span className="truncate">{place.province}</span>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-1.5">
                      <Skeleton className="h-3.5 w-20" />
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  )}
                </div>
              </div>
            </ExpandableTrigger>
          )}

          {/* ── EXPANDED HERO IMAGE ── */}
          {isExpanded && (
            <ExpandableCardHeader className="p-0 shrink-0 h-44 relative">
              <div className="relative w-full h-full overflow-hidden">
                {place ? (
                  <Image
                    src={place.images[0] || "/placeholder.jpg"}
                    alt={place.name}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <Skeleton className="w-full h-full rounded-none" />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />

                {/* Action buttons */}
                <div className="absolute top-3 right-3 flex gap-2 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!session) {
                        triggerLoginAlert();
                        return;
                      }
                      toggleFavorite.mutate();
                    }}
                    className={cn(
                      "h-9 w-9 rounded-full flex items-center justify-center border transition-all active:scale-90 shadow-lg",
                      isFavorited
                        ? "bg-rose-500 border-rose-400 text-white"
                        : "bg-black/60 backdrop-blur-sm border-white/20 text-white hover:bg-black/80",
                    )}
                  >
                    {toggleFavorite.isPending ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Heart
                        size={15}
                        className={cn(isFavorited && "fill-current")}
                      />
                    )}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand();
                    }}
                    className="h-10 w-10 rounded-full bg-black border border-white/20 text-white hover:bg-zinc-900 flex items-center justify-center transition-all active:scale-90 shadow-xl"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Clickable area to collapse (Overlay under buttons) */}
                <ExpandableTrigger
                  className="absolute inset-0"
                  children={<div className="w-full h-full" />}
                />

                {/* Place info overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
                  <div className="flex items-end justify-between">
                    <div>
                      <Badge className="mb-1.5 bg-white/15 backdrop-blur-sm border-white/20 text-white text-[9px] font-bold uppercase tracking-wider">
                        {place?.category}
                      </Badge>
                      <h2 className="text-xl font-bold text-white leading-tight drop-shadow">
                        {place?.name}
                      </h2>
                      <div className="flex items-center gap-1 text-white/70 text-[11px] mt-0.5">
                        <MapPin size={10} />
                        {place?.province}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2.5 py-1 border border-white/10 mb-1">
                      <Star
                        size={12}
                        className="fill-amber-400 text-amber-400"
                      />
                      <span className="text-white text-sm font-bold">
                        {place?.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </ExpandableCardHeader>
          )}

          {/* ── EXPANDED BODY ── */}
          {isExpanded && (
            <ExpandableContent className="flex-1 min-h-0 flex flex-col">
              <AnimatePresence mode="wait">
                {!isContentReady ? (
                  <motion.div
                    key="skeleton"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 space-y-4 flex-1"
                  >
                    <div className="flex gap-2">
                      <Skeleton className="h-9 flex-1 rounded-lg" />
                      <Skeleton className="h-9 flex-1 rounded-lg" />
                      <Skeleton className="h-9 flex-1 rounded-lg" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-3.5 w-full" />
                      <Skeleton className="h-3.5 w-5/6" />
                      <Skeleton className="h-3.5 w-4/6" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Skeleton className="aspect-video rounded-xl" />
                      <Skeleton className="aspect-video rounded-xl" />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col flex-1 min-h-0"
                  >
                    <ExpandableCardContent className="p-0 flex-1 min-h-0 flex flex-col">
                      <Tabs
                        value={activeTab}
                        onValueChange={(v) => setActiveTab(v as any)}
                        className="flex flex-col flex-1 min-h-0"
                      >
                        {/* Tab bar */}
                        <div className="px-4 pt-3 pb-0">
                          <TabsList className="w-full grid grid-cols-3 h-9 bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
                            <TabsTrigger
                              value="detail"
                              className="rounded-lg text-[11px] font-semibold flex items-center gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700 data-[state=active]:shadow-sm"
                            >
                              <Info size={11} />
                              About
                            </TabsTrigger>
                            <TabsTrigger
                              value="accommodation"
                              className="rounded-lg text-[11px] font-semibold flex items-center gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700 data-[state=active]:shadow-sm"
                            >
                              <Bed size={11} />
                              Sleep
                            </TabsTrigger>
                            <TabsTrigger
                              value="food"
                              className="rounded-lg text-[11px] font-semibold flex items-center gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700 data-[state=active]:shadow-sm"
                            >
                              <UtensilsCrossed size={11} />
                              Eat
                            </TabsTrigger>
                          </TabsList>
                        </div>

                        <ScrollArea className="flex-1 min-h-0 mt-2">
                          {/* ABOUT */}
                          <TabsContent
                            value="detail"
                            className="mt-0 px-4 pb-4 space-y-4 outline-none"
                          >
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                              {place?.description ||
                                "No description available."}
                            </p>
                            {(place?.images?.length ?? 0) > 1 && (
                              <>
                                <div className="flex items-center gap-2">
                                  <Separator className="flex-1" />
                                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                    Gallery
                                  </span>
                                  <Separator className="flex-1" />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  {place?.images.slice(1).map((img, i) => (
                                    <motion.div
                                      key={i}
                                      whileHover={{ scale: 1.02 }}
                                      className="relative aspect-video rounded-xl overflow-hidden border border-zinc-100 dark:border-zinc-800 shadow-sm"
                                    >
                                      <Image
                                        src={img}
                                        alt="Gallery"
                                        fill
                                        className="object-cover"
                                      />
                                    </motion.div>
                                  ))}
                                </div>
                              </>
                            )}
                          </TabsContent>

                          {/* SLEEP */}
                          <TabsContent
                            value="accommodation"
                            className="mt-0 px-4 pb-4 space-y-2 outline-none"
                          >
                            {place?.accommodations?.length ? (
                              place.accommodations.map((acc) => (
                                <div
                                  key={acc.id}
                                  className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 hover:border-primary/30 transition-all group"
                                >
                                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <Bed size={16} className="text-primary" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                                      {acc.name}
                                    </p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                      {acc.type} · {acc.priceRange}
                                    </p>
                                  </div>
                                  {acc.bookingUrl && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 rounded-full shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                      asChild
                                    >
                                      <a
                                        href={acc.bookingUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <ExternalLink size={12} />
                                      </a>
                                    </Button>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="flex flex-col items-center justify-center py-10 text-zinc-400 gap-2">
                                <Bed size={26} strokeWidth={1.5} />
                                <p className="text-xs">
                                  No accommodations listed yet
                                </p>
                              </div>
                            )}
                          </TabsContent>

                          {/* EAT */}
                          <TabsContent
                            value="food"
                            className="mt-0 px-4 pb-4 space-y-2 outline-none"
                          >
                            {place?.foods?.length ? (
                              place.foods.map((food) => (
                                <div
                                  key={food.id}
                                  className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 hover:border-orange-200 dark:hover:border-orange-900/50 transition-all"
                                >
                                  <div className="w-9 h-9 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center shrink-0">
                                    <UtensilsCrossed
                                      size={16}
                                      className="text-orange-500"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                                      {food.name}
                                    </p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                      {food.type} · {food.priceRange}
                                    </p>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="flex flex-col items-center justify-center py-10 text-zinc-400 gap-2">
                                <UtensilsCrossed size={26} strokeWidth={1.5} />
                                <p className="text-xs">
                                  No food spots listed yet
                                </p>
                              </div>
                            )}
                          </TabsContent>
                        </ScrollArea>
                      </Tabs>
                    </ExpandableCardContent>

                    {/* Footer */}
                    <ExpandableCardFooter className="shrink-0 px-4 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-0.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white gap-1.5 rounded-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShare();
                            }}
                          >
                            <Share2 size={13} />
                            Share
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 text-xs text-zinc-500 hover:text-primary gap-1.5 rounded-lg"
                            asChild
                          >
                            <a
                              href={`https://www.google.com/maps?q=${place?.lat},${place?.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Navigation size={13} />
                              Directions
                            </a>
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          className="h-8 px-4 text-xs font-semibold rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!session) {
                              triggerLoginAlert();
                              return;
                            }
                            // Navigate to review or show review modal
                            toast.info("Reviews coming soon!");
                          }}
                        >
                          Write a Review
                        </Button>
                      </div>
                    </ExpandableCardFooter>
                  </motion.div>
                )}
              </AnimatePresence>
            </ExpandableContent>
          )}
        </div>
      </ExpandableCard>

      <AlertDialog open={showLoginAlert} onOpenChange={setShowLoginAlert}>
        <AlertDialogContent className="rounded-3xl border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl">
          <AlertDialogHeader>
            <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <LogIn className="text-primary" size={24} />
            </div>
            <AlertDialogTitle className="text-2xl font-bold text-center">
              Join Lomhea
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-zinc-500 dark:text-zinc-400">
              Create an account or sign in to save your favorite places, share
              reviews, and track your travels across Cambodia.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-col gap-2 mt-4">
            <AlertDialogAction asChild>
              <Link
                href="/login"
                className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold flex items-center justify-center"
                onClick={() => setShowLoginAlert(false)}
              >
                Sign In to Continue
              </Link>
            </AlertDialogAction>
            <AlertDialogCancel className="w-full h-11 rounded-xl border-zinc-200 dark:border-zinc-800 font-bold">
              Maybe Later
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {place && (
        <ShareDialog
          placeName={place.name}
          placeId={place.id}
          open={isShareOpen}
          onOpenChange={setIsShareOpen}
        />
      )}
    </>
  );
}

export function PlaceDetailCard() {
  const { isPanelOpen } = useUIStore();
  const { selectedPlaceId } = useMapStore();

  if (!isPanelOpen || !selectedPlaceId) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 pointer-events-none w-full max-w-[95vw] md:max-w-none flex justify-center">
      <div className="pointer-events-auto">
        <Expandable initialExpanded={false}>
          {({ isExpanded, toggleExpand }) => (
            <CardInner isExpanded={isExpanded} toggleExpand={toggleExpand} />
          )}
        </Expandable>
      </div>
    </div>
  );
}
