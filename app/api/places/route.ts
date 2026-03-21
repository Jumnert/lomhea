import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  try {
    const places = await prisma.place.findMany({
      where: category && category !== "All" ? { category } : {},
      include: {
        accommodations: true,
        foods: true,
        reviews: {
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(places);
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

  if (!session || session.user.role !== "ADMIN") {
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

    return NextResponse.json(place);
  } catch (error) {
    console.error("Create place error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
