import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher";
import { getOrSetCache, invalidatePattern } from "@/lib/redis-utils";
import { placeSchema } from "@/lib/validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  try {
    const cacheKey = `places:${category || "All"}`;

    const places = await getOrSetCache(
      cacheKey,
      async () => {
        // Optimization: Only select what's needed for the map pins/cards
        return await prisma.place.findMany({
          where: category && category !== "All" ? { category } : {},
          select: {
            id: true,
            name: true,
            nameKh: true,
            lat: true,
            lng: true,
            category: true,
            province: true,
            images: true,
            rating: true,
            reviewCount: true,
            isVerified: true,
          },
          orderBy: { createdAt: "desc" },
        });
      },
      600,
    ); // Cache for 10 minutes

    return NextResponse.json(places, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch places" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const allowedRoles = ["ADMIN", "MODERATOR", "CONTRIBUTOR"];
  if (!session || !allowedRoles.includes((session.user as any).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Validate and sanitize input
    const validatedData = placeSchema.parse(body);
    const { name, nameKh, description, lat, lng, category, province, images } =
      validatedData;

    const place = await prisma.place.create({
      data: {
        name,
        nameKh,
        description,
        lat,
        lng,
        category,
        province,
        images: images || [],
        isVerified: true,
      },
    });

    // Invalidate all places cache
    await invalidatePattern("places:*");

    await pusherServer.trigger("places", "places-updated", {});
    return NextResponse.json(place);
  } catch (error) {
    console.error("Create place error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
