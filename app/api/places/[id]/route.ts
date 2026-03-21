import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const revalidate = 600; // Cache for 10 minutes

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const place = await prisma.place.findUnique({
      where: { id },
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
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!place) {
      return NextResponse.json({ error: "Place not found" }, { status: 404 });
    }

    return NextResponse.json(place, {
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch place detail" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  try {
    const updatedPlace = await prisma.place.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(updatedPlace);
  } catch (error) {
    console.error("Update place error:", error);
    return NextResponse.json(
      { error: "Failed to update place" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.place.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete place error:", error);
    return NextResponse.json(
      { error: "Failed to delete place" },
      { status: 500 },
    );
  }
}
