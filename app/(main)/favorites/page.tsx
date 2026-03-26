"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Compass,
  Heart,
  Loader2,
  MapPin,
  Star,
} from "lucide-react";
import { toast } from "sonner";

import { Navbar } from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/lib/auth-client";
import { useMapStore } from "@/stores/mapStore";
import { useUIStore } from "@/stores/uiStore";
import { Place } from "@/types/app";

type FavoritesTab = "all" | "featured" | "topRated";

function FavoritesGrid({
  places,
  onOpenMap,
  onRemove,
  removingId,
}: {
  places: Place[];
  onOpenMap: (placeId: string) => void;
  onRemove: (placeId: string) => void;
  removingId?: string;
}) {
  if (places.length === 0) {
    return (
      <Card className="rounded-3xl border-dashed py-0">
        <CardContent className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
          <div className="mb-4 rounded-full border bg-muted p-4">
            <Heart className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Nothing in this view yet</CardTitle>
          <CardDescription className="mt-2 max-w-md text-sm leading-6">
            Try another tab or save more places from the map to build your own
            Cambodia shortlist.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {places.map((place) => {
        const isRemoving = removingId === place.id;

        return (
          <Card key={place.id} className="overflow-hidden rounded-3xl py-0">
            <div className="relative h-56 overflow-hidden">
              <Image
                src={place.images[0] || "/placeholder-place.jpg"}
                alt={place.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                <Badge variant="secondary" className="rounded-full">
                  {place.category}
                </Badge>
                {place.isFeatured ? (
                  <Badge className="rounded-full bg-amber-400 text-stone-950 hover:bg-amber-400">
                    Featured
                  </Badge>
                ) : null}
              </div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="mb-1 flex items-center gap-1 text-sm text-amber-300">
                  <Star className="h-4 w-4 fill-current" />
                  {place.rating.toFixed(1)}
                  <span className="text-white/70">({place.reviewCount})</span>
                </p>
                <h3 className="text-2xl font-semibold">{place.name}</h3>
                <p className="mt-1 flex items-center gap-1 text-sm text-white/80">
                  <MapPin className="h-4 w-4" />
                  {place.province}
                </p>
              </div>
            </div>

            <CardHeader className="gap-3">
              <CardTitle className="text-lg leading-tight">
                {place.nameKh || place.name}
              </CardTitle>
              <CardDescription className="line-clamp-3 text-sm leading-6">
                {place.description ||
                  "Saved for your next route through Cambodia."}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border bg-muted/40 p-3">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Province
                  </p>
                  <p className="mt-1 text-sm font-semibold">{place.province}</p>
                </div>
                <div className="rounded-2xl border bg-muted/40 p-3">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Reviews
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    {place.reviewCount}
                  </p>
                </div>
              </div>
            </CardContent>

            <Separator />

            <CardFooter className="flex gap-3 px-6 py-5">
              <Button className="flex-1 rounded-2xl" onClick={() => onOpenMap(place.id)}>
                View on map
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl"
                disabled={isRemoving}
                onClick={() => onRemove(place.id)}
              >
                {isRemoving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Heart className="mr-2 h-4 w-4 fill-current" />
                )}
                Remove
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

export default function FavoritesPage() {
  const { data: session, isPending: sessionPending } = useSession();
  const { setSelectedPlaceId } = useMapStore();
  const { setPanelOpen } = useUIStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: favoritedPlaces = [], isLoading } = useQuery<Place[]>({
    queryKey: ["favorited-places"],
    queryFn: async () => {
      const favoritesResponse = await fetch("/api/favorites");
      if (!favoritesResponse.ok) return [];

      const favoriteIds: string[] = await favoritesResponse.json();
      if (favoriteIds.length === 0) return [];

      const placesResponse = await fetch("/api/places");
      if (!placesResponse.ok) return [];

      const allPlaces: Place[] = await placesResponse.json();
      return allPlaces.filter((place) => favoriteIds.includes(place.id));
    },
    enabled: !!session,
  });

  const removeFavorite = useMutation({
    mutationFn: async (placeId: string) => {
      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placeId }),
      });

      if (!response.ok) {
        throw new Error("Failed to update favorites");
      }

      return response.json() as Promise<{ favorited: boolean }>;
    },
    onMutate: async (placeId) => {
      await queryClient.cancelQueries({ queryKey: ["favorited-places"] });
      const previousPlaces =
        queryClient.getQueryData<Place[]>(["favorited-places"]) ?? [];

      queryClient.setQueryData<Place[]>(["favorited-places"], (current = []) =>
        current.filter((place) => place.id !== placeId),
      );

      return { previousPlaces };
    },
    onError: (_error, _placeId, context) => {
      if (context?.previousPlaces) {
        queryClient.setQueryData(["favorited-places"], context.previousPlaces);
      }
      toast.error("Could not remove this place from favorites.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      toast.success("Removed from favorites.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["favorited-places"] });
    },
  });

  const handleOpenMap = (placeId: string) => {
    setSelectedPlaceId(placeId);
    setPanelOpen(true);
    router.push("/");
  };

  const averageRating = useMemo(() => {
    if (favoritedPlaces.length === 0) return "0.0";
    const total = favoritedPlaces.reduce(
      (sum, place) => sum + (place.rating || 0),
      0,
    );
    return (total / favoritedPlaces.length).toFixed(1);
  }, [favoritedPlaces]);

  const featuredPlaces = useMemo(
    () => favoritedPlaces.filter((place) => place.isFeatured),
    [favoritedPlaces],
  );

  const topRatedPlaces = useMemo(
    () => favoritedPlaces.filter((place) => place.rating >= 4.5),
    [favoritedPlaces],
  );

  const tabData: Record<FavoritesTab, Place[]> = {
    all: favoritedPlaces,
    featured: featuredPlaces,
    topRated: topRatedPlaces,
  };

  if (sessionPending || isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">
          Loading your favorites...
        </p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen w-full bg-background">
        <Navbar />
        <main className="mx-auto flex w-full max-w-5xl px-6 pt-28 pb-16">
          <Card className="w-full rounded-3xl">
            <CardHeader className="space-y-4">
              <Badge variant="secondary" className="w-fit rounded-full px-3 py-1">
                Favorites
              </Badge>
              <CardTitle className="text-4xl tracking-tight">
                Sign in to see your saved places
              </CardTitle>
              <CardDescription className="max-w-2xl text-base leading-7">
                Build your own Cambodia shortlist, reopen places from the map,
                and keep everything in one neat collection.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <Card className="rounded-2xl border bg-muted/40 py-4 shadow-none">
                <CardContent className="px-5">
                  <p className="text-sm font-semibold">Save temples and beaches</p>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border bg-muted/40 py-4 shadow-none">
                <CardContent className="px-5">
                  <p className="text-sm font-semibold">Jump back into the map fast</p>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border bg-muted/40 py-4 shadow-none">
                <CardContent className="px-5">
                  <p className="text-sm font-semibold">Keep your trip plans organized</p>
                </CardContent>
              </Card>
            </CardContent>
            <CardFooter className="px-6 pb-6">
              <Button asChild className="rounded-2xl">
                <Link href="/login">Go to login</Link>
              </Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background pb-16">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-6 pt-28">
        <div className="mb-6">
          <Button
            type="button"
            variant="outline"
            className="rounded-2xl shadow-sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <Card className="rounded-3xl shadow-[0_18px_45px_-24px_rgba(15,23,42,0.22)]">
            <CardHeader className="space-y-4">
              <Badge variant="secondary" className="w-fit rounded-full px-3 py-1">
                My favorites
              </Badge>
              <div className="space-y-2">
                <CardTitle className="text-4xl tracking-tight">
                  Saved places across Cambodia
                </CardTitle>
                <CardDescription className="max-w-2xl text-base leading-7">
                  A simpler list of the places you want to revisit, compare, or
                  reopen on the map later.
                </CardDescription>
              </div>
            </CardHeader>
            <CardFooter className="flex flex-wrap gap-3 px-6 pb-6">
              <Button asChild className="rounded-2xl">
                <Link href="/">Explore more places</Link>
              </Button>
              <Button
                variant="outline"
                className="rounded-2xl"
                onClick={() => router.push("/contribute")}
              >
                Contribute a place
              </Button>
            </CardFooter>
          </Card>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <Card className="rounded-3xl shadow-[0_16px_38px_-26px_rgba(15,23,42,0.22)]">
              <CardHeader className="pb-2">
                <CardDescription>Saved spots</CardDescription>
                <CardTitle className="text-3xl">{favoritedPlaces.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="rounded-3xl shadow-[0_16px_38px_-26px_rgba(15,23,42,0.22)]">
              <CardHeader className="pb-2">
                <CardDescription>Average rating</CardDescription>
                <CardTitle className="text-3xl">{averageRating}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="rounded-3xl shadow-[0_16px_38px_-26px_rgba(15,23,42,0.22)]">
              <CardHeader className="pb-2">
                <CardDescription>Featured</CardDescription>
                <CardTitle className="text-3xl">{featuredPlaces.length}</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>

        <Card className="mt-8 rounded-3xl shadow-[0_20px_50px_-30px_rgba(15,23,42,0.2)]">
          <CardHeader className="space-y-3">
            <CardTitle className="text-2xl">Browse your collection</CardTitle>
            <CardDescription>
              Filter your saved list into featured places or highly rated stops.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {favoritedPlaces.length === 0 ? (
              <Card className="rounded-3xl border-dashed py-0 shadow-none">
                <CardContent className="flex min-h-80 flex-col items-center justify-center px-6 py-12 text-center">
                  <div className="mb-4 rounded-full border bg-muted p-4">
                    <Compass className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-2xl">No favorites yet</CardTitle>
                  <CardDescription className="mt-2 max-w-md text-sm leading-6">
                    Heart places from the map and they&apos;ll appear here in a much
                    easier list for planning later.
                  </CardDescription>
                  <Button asChild className="mt-6 rounded-2xl">
                    <Link href="/">Explore the map</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Tabs defaultValue="all" className="w-full">
                <TabsList variant="default" className="w-full justify-start rounded-2xl">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="featured">Featured</TabsTrigger>
                  <TabsTrigger value="topRated">Top rated</TabsTrigger>
                </TabsList>

                {(Object.keys(tabData) as FavoritesTab[]).map((tab) => (
                  <TabsContent key={tab} value={tab} className="pt-2">
                    <FavoritesGrid
                      places={tabData[tab]}
                      onOpenMap={handleOpenMap}
                      onRemove={(placeId) => removeFavorite.mutate(placeId)}
                      removingId={removeFavorite.variables}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
