import { NextResponse } from "next/server";
import { getOrSetCache } from "@/lib/redis-utils";

type Hotel = {
  id: string;
  name: string;
  rating: number | null;
  price: string | null;
  url: string | null;
};

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function parsePrice(tags: Record<string, string | undefined>) {
  if (tags["price:range"]) return tags["price:range"] || null;
  if (tags.price) return tags.price || null;
  if (tags.charge) return tags.charge || null;
  return null;
}

function parseRating(tags: Record<string, string | undefined>) {
  const stars = Number(tags.stars || tags["hotel:stars"]);
  if (!Number.isFinite(stars) || stars <= 0) return null;
  return clamp(stars, 1, 5);
}

function websiteUrl(tags: Record<string, string | undefined>) {
  const raw = tags.website || tags["contact:website"] || tags.url;
  if (!raw) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  return `https://${raw}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  const name = (searchParams.get("name") || "").trim();
  const province = (searchParams.get("province") || "").trim();

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "lat/lng required" }, { status: 400 });
  }

  const cacheKey = `hotels:${lat.toFixed(3)}:${lng.toFixed(3)}`;

  try {
    const hotels = await getOrSetCache<Hotel[]>(
      cacheKey,
      async () => {
        const query = `
          [out:json][timeout:25];
          (
            node(around:18000,${lat},${lng})["tourism"~"hotel|hostel|guest_house|motel"];
            way(around:18000,${lat},${lng})["tourism"~"hotel|hostel|guest_house|motel"];
            relation(around:18000,${lat},${lng})["tourism"~"hotel|hostel|guest_house|motel"];
          );
          out center tags 50;
        `;

        const res = await fetch("https://overpass-api.de/api/interpreter", {
          method: "POST",
          headers: { "Content-Type": "text/plain" },
          body: query,
          cache: "no-store",
        });

        if (!res.ok) throw new Error(`Overpass failed: ${res.status}`);
        const data = await res.json();
        const elements = Array.isArray(data.elements) ? data.elements : [];

        const mapped: Hotel[] = elements
          .map((el: any) => {
            const tags = (el.tags || {}) as Record<string, string | undefined>;
            const hotelName = tags.name || tags["name:en"] || tags["brand"];
            if (!hotelName) return null;
            return {
              id: `${el.type}-${el.id}`,
              name: hotelName,
              rating: parseRating(tags),
              price: parsePrice(tags),
              url: websiteUrl(tags),
            };
          })
          .filter((h: Hotel | null): h is Hotel => Boolean(h))
          .slice(0, 20);

        return mapped;
      },
      60 * 30,
    );

    return NextResponse.json(
      {
        source: "OpenStreetMap Overpass (free)",
        hint: `Hotels near ${name || "place"} ${province ? `in ${province}` : ""}`,
        hotels,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1800",
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch hotels", hotels: [] },
      { status: 500 },
    );
  }
}

