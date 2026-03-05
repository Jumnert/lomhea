"use client";

import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Place } from "@/types/app";
import {
  Heart,
  MapPin,
  Star,
  ArrowRight,
  Compass,
  Loader2,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "@/lib/auth-client";
import { useUIStore } from "@/stores/uiStore";
import { useMapStore } from "@/stores/mapStore";
import { useRouter } from "next/navigation";

export default function FavoritesPage() {
  const { data: session, isPending: sessionPending } = useSession();
  const { setSelectedPlaceId } = useMapStore();
  const { setPanelOpen } = useUIStore();
  const router = useRouter();

  const { data: favoritedPlaces, isLoading } = useQuery<Place[]>({
    queryKey: ["favorited-places"],
    queryFn: async () => {
      // First get IDs
      const favRes = await fetch("/api/favorites");
      if (!favRes.ok) return [];
      const favIds: string[] = await favRes.json();

      if (favIds.length === 0) return [];

      // Then get full details (In a real app, we might have an API for multiple IDs)
      const placesRes = await fetch("/api/places");
      if (!placesRes.ok) return [];
      const allPlaces: Place[] = await placesRes.json();

      return allPlaces.filter((p) => favIds.includes(p.id));
    },
    enabled: !!session,
  });

  const handleViewOnMap = (placeId: string) => {
    setSelectedPlaceId(placeId);
    setPanelOpen(true);
    router.push("/");
  };

  if (sessionPending || isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="font-bold text-zinc-400">Loading your favorites...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-zinc-100 flex items-center justify-center mb-6">
          <Heart size={40} className="text-zinc-300" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Login Required</h1>
        <p className="text-zinc-500 mb-8 max-w-sm">
          Please sign in to view and manage your favorite places in Cambodia.
        </p>
        <Button asChild className="h-12 px-8 rounded-2xl font-bold shadow-xl">
          <Link href="/login">Go to Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-32">
        <header className="mb-12">
          <div className="flex items-center gap-3 text-rose-500 mb-2">
            <Heart size={24} className="fill-current" />
            <span className="font-bold uppercase tracking-widest text-xs">
              My Collection
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            Saved Favorites
          </h1>
          <p className="text-zinc-500 mt-2 text-lg">
            Your personal list of the best of Cambodia.
          </p>
        </header>

        {favoritedPlaces?.length === 0 ? (
          <Card className="border-none shadow-xl shadow-zinc-200/50 dark:shadow-none rounded-3xl p-12 text-center">
            <div className="mx-auto w-24 h-24 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center mb-6">
              <Compass size={40} className="text-zinc-300" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No favorites yet</h3>
            <p className="text-zinc-500 mb-8 max-w-sm mx-auto">
              Explore the map and heart your favorite places to keep them safe
              here.
            </p>
            <Button
              asChild
              variant="outline"
              className="h-12 px-8 rounded-2xl border-zinc-200 font-bold"
            >
              <Link href="/">Explore the Map</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {favoritedPlaces?.map((place) => (
              <Card
                key={place.id}
                className="group relative border-none shadow-xl shadow-zinc-200/50 dark:shadow-none rounded-3xl overflow-hidden hover:scale-[1.02] transition-all"
              >
                <div className="relative h-64">
                  <Image
                    src={place.images[0] || "/placeholder-place.jpg"}
                    alt={place.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />

                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white/20 backdrop-blur-md text-white border-white/20">
                      {place.category}
                    </Badge>
                  </div>

                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center gap-1.5 text-amber-400 mb-1">
                      <Star size={14} className="fill-current" />
                      <span className="text-sm font-bold">
                        {place.rating.toFixed(1)}
                      </span>
                      <span className="text-xs text-white/60 font-medium">
                        ({place.reviewCount})
                      </span>
                    </div>
                    <h3 className="text-2xl font-extrabold text-white mb-1 leading-tight">
                      {place.name}
                    </h3>
                    <div className="flex items-center gap-1 text-white/70 text-sm">
                      <MapPin size={14} />
                      {place.province}
                    </div>
                  </div>
                </div>

                <CardContent className="p-6">
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm line-clamp-2 mb-6">
                    {place.description}
                  </p>
                  <div className="flex gap-3">
                    <Button
                      className="flex-1 h-12 rounded-2xl font-bold shadow-lg"
                      onClick={() => handleViewOnMap(place.id)}
                    >
                      View Details <ArrowRight size={18} className="ml-2" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 rounded-2xl border-zinc-200 text-rose-500 hover:bg-rose-50 hover:border-rose-200"
                    >
                      <Trash2 size={20} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
