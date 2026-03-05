import { prisma } from "@/lib/db";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Star,
  ChevronLeft,
  Bed,
  UtensilsCrossed,
  Navigation,
  Info,
} from "lucide-react";
import { ShareDialog } from "@/components/modals/ShareDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface Accommodation {
  id: string;
  name: string;
  type: string;
  priceRange: string;
}

interface Food {
  id: string;
  name: string;
  type: string;
  priceRange: string;
}

interface PlaceWithRelations {
  id: string;
  name: string;
  description: string | null;
  province: string;
  category: string;
  rating: number;
  lat: number;
  lng: number;
  reviewCount: number;
  images: string[];
  accommodations: Accommodation[];
  foods: Food[];
}

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const awaitedParams = await params;
  const id = awaitedParams.id;
  const place = (await (prisma.place as any).findUnique({
    where: { id: id },
  })) as any;

  if (!place) return { title: "Place Not Found - Lomhea" };

  const title = `${place.name} - Explore Cambodia with Lomhea`;
  const description =
    place.description ||
    `Discover ${place.name} in ${place.province}. See photos, reviews and more on Lomhea.`;
  const image = place.images?.[0] || "/og-image.jpg";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [image],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function PlacePage({ params }: Props) {
  const awaitedParams = await params;
  const id = awaitedParams.id;
  const placeResult = await (prisma.place as any).findUnique({
    where: { id: id },
    include: {
      accommodations: true,
      foods: true,
    },
  });

  if (!placeResult) notFound();

  const place = placeResult as unknown as PlaceWithRelations;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Hero Header */}
      <div className="relative h-[40vh] md:h-[60vh] w-full overflow-hidden">
        <Image
          src={place.images[0] || "/placeholder.jpg"}
          alt={place.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute top-6 left-6 z-10">
          <Button
            variant="secondary"
            className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 rounded-full"
            asChild
          >
            <Link href="/">
              <ChevronLeft size={18} className="mr-2" />
              Back to Map
            </Link>
          </Button>
        </div>

        <div className="absolute bottom-12 left-0 right-0 px-6 max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <Badge className="bg-primary/20 backdrop-blur-md border-primary/30 text-primary-foreground text-sm py-1 px-4 rounded-full uppercase tracking-widest font-bold">
                {place.category}
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
                {place.name}
              </h1>
              <div className="flex items-center gap-4 text-white/80">
                <div className="flex items-center gap-1.5 font-medium">
                  <MapPin size={18} className="text-primary" />
                  {place.province}, Cambodia
                </div>
                <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                  <Star size={16} className="fill-amber-400 text-amber-400" />
                  <span className="font-bold text-white">
                    {place.rating.toFixed(1)}
                  </span>
                  <span className="text-xs text-white/60">
                    ({place.reviewCount} reviews)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                size="lg"
                className="rounded-full bg-primary hover:bg-primary/90 shadow-xl"
                asChild
              >
                <a
                  href={`https://www.google.com/maps?q=${place.lat},${place.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Navigation size={18} className="mr-2" />
                  Directions
                </a>
              </Button>
              <ShareDialog placeName={place.name} placeId={place.id} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Info */}
          <div className="lg:col-span-2 space-y-12">
            <section>
              <div className="flex items-center gap-2 mb-6 text-zinc-900 dark:text-white">
                <Info size={24} className="text-primary" />
                <h2 className="text-2xl font-bold">About {place.name}</h2>
              </div>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
                {place.description ||
                  "Discover the beauty and history of this amazing location. Lomhea brings you the best of Cambodia's destinations with curated information and community reviews."}
              </p>
            </section>

            {place.images.length > 1 && (
              <section>
                <h3 className="text-xl font-bold mb-6 text-zinc-900 dark:text-white flex items-center gap-2">
                  <span className="w-8 h-[2px] bg-primary"></span>
                  Visual Journey
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {place.images.slice(1).map((img: string, i: number) => (
                    <div
                      key={i}
                      className="relative aspect-video rounded-3xl overflow-hidden shadow-lg hover:ring-4 hover:ring-primary/20 transition-all group"
                    >
                      <Image
                        src={img}
                        alt={`${place.name} gallery ${i + 1}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column: Local Services */}
          <div className="space-y-8">
            <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl h-fit">
              <div className="space-y-8">
                {/* Stay */}
                <section>
                  <h3 className="flex items-center gap-2 font-bold mb-4 text-zinc-900 dark:text-white">
                    <Bed size={20} className="text-primary" />
                    Where to Stay
                  </h3>
                  {place.accommodations.length > 0 ? (
                    <div className="space-y-3">
                      {place.accommodations.map((acc) => (
                        <div
                          key={acc.id}
                          className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900"
                        >
                          <p className="font-bold text-sm">{acc.name}</p>
                          <p className="text-xs text-zinc-500">
                            {acc.type} • {acc.priceRange}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl text-center italic">
                      Coming soon to Lomhea
                    </p>
                  )}
                </section>

                <Separator />

                {/* Eat */}
                <section>
                  <h3 className="flex items-center gap-2 font-bold mb-4 text-zinc-900 dark:text-white">
                    <UtensilsCrossed size={20} className="text-orange-500" />
                    Authentic Eats
                  </h3>
                  {place.foods.length > 0 ? (
                    <div className="space-y-3">
                      {place.foods.map((food) => (
                        <div
                          key={food.id}
                          className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900"
                        >
                          <p className="font-bold text-sm">{food.name}</p>
                          <p className="text-xs text-zinc-500">
                            {food.type} • {food.priceRange}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl text-center italic">
                      Food guides coming soon
                    </p>
                  )}
                </section>

                <div className="pt-4">
                  <ShareDialog placeName={place.name} placeId={place.id} />
                </div>
              </div>
            </div>

            {/* Lomhea Promo */}
            <div className="p-6 rounded-3xl bg-linear-to-br from-primary/10 to-primary/5 border border-primary/20">
              <h4 className="font-bold text-primary mb-2">
                Join Lomhea Explorer
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4">
                Save your favorite spots, contribute with photos, and help the
                community grow.
              </p>
              <Button
                className="w-full rounded-xl font-bold bg-primary text-white"
                asChild
              >
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Branded */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-12 mt-12 bg-white dark:bg-zinc-900">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-primary mb-2">Lomhea</h2>
          <p className="text-zinc-500 text-sm max-w-md mx-auto">
            The digital gateway to Cambodia's hidden gems. Plan your next
            adventure with local insights.
          </p>
          <div className="mt-8 flex justify-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-zinc-400 hover:text-primary"
            >
              Map
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-zinc-400 hover:text-primary"
            >
              About Us
            </Link>
            <Link
              href="/terms"
              className="text-sm font-medium text-zinc-400 hover:text-primary"
            >
              Terms
            </Link>
          </div>
          <p className="mt-8 text-[10px] text-zinc-300 uppercase tracking-widest">
            © {new Date().getFullYear()} Lomhea Explorer. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
