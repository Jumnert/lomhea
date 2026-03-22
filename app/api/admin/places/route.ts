import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (
    !session ||
    (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const places = await (prisma.place as any).findMany({
      select: {
        id: true,
        name: true,
        nameKh: true,
        category: true,
        province: true,
        images: true,
        isVerified: true,
        isFeatured: true,
        featuredUntil: true,
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(places);
  } catch (error) {
    // Backward compatibility if featured columns are not migrated yet.
    const legacyPlaces = await prisma.place.findMany({
      select: {
        id: true,
        name: true,
        nameKh: true,
        category: true,
        province: true,
        images: true,
        isVerified: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      legacyPlaces.map((p) => ({
        ...p,
        isFeatured: false,
        featuredUntil: null,
      })),
    );
  }
}

