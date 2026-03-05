import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [
      totalUsers,
      totalPlaces,
      totalReviews,
      totalFavorites,
      recentReviews,
      pendingRequests,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.place.count(),
      prisma.review.count(),
      prisma.favorite.count(),
      prisma.review.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, image: true } },
          place: { select: { name: true } },
        },
      }),
      (prisma as any).placeRequest.findMany({
        where: { status: "PENDING" },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true } },
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        totalPlaces,
        totalReviews,
        totalFavorites,
      },
      recentReviews,
      pendingRequests,
    });
  } catch (error) {
    console.error("Fetch admin overview error:", error);
    return NextResponse.json(
      { error: "Failed to fetch overview" },
      { status: 500 },
    );
  }
}
