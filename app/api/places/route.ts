import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  try {
    // Optimization: Only select what's needed for the map pins/cards
    // This reduces the payload and database stress massively compared to fetching everything
    const places = await prisma.place.findMany({
      where: category && category !== "All" ? { category } : {},
      select: {
        id: true,
        name: true,
        nameKh: true,
        lat: true,
        lng: true,
        category: true,
        province: true,
        images: true, // Needed for simple thumbnails
        rating: true,
        reviewCount: true,
        isVerified: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(places, {
      headers: {
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=50",
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
    const { name, nameKh, description, lat, lng, category, province, images } =
      body;

    const place = await prisma.place.create({
      data: {
        name,
        nameKh,
        description,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        category,
        province,
        images: images || [],
        isVerified: true,
      },
    });

    await pusherServer.trigger("places", "places-updated", {});
    return NextResponse.json(place);
  } catch (error) {
    console.error("Create place error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
