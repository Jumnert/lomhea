import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { invalidatePattern } from "@/lib/redis-utils";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Only ADMIN can highlight/unhighlight places." },
      { status: 401 },
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const highlight = Boolean(body?.highlight);
    const durationDays =
      typeof body?.durationDays === "number" && body.durationDays > 0
        ? Math.min(body.durationDays, 365)
        : 30;

    const featuredUntil = highlight
      ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)
      : null;

    const updatedPlace = await (prisma.place as any).update({
      where: { id },
      data: {
        isFeatured: highlight,
        featuredUntil,
      },
      select: {
        id: true,
        name: true,
        isFeatured: true,
        featuredUntil: true,
      },
    });

    await invalidatePattern("places:*");
    await pusherServer.trigger("places", "places-updated", {});

    return NextResponse.json(updatedPlace);
  } catch (error) {
    console.error("Admin place highlight error:", error);
    if (
      error instanceof Error &&
      error.message.toLowerCase().includes("isfeatured")
    ) {
      return NextResponse.json(
        {
          error:
            "Database is not migrated for featured fields yet. Please add Place.isFeatured and Place.featuredUntil columns.",
        },
        { status: 500 },
      );
    }
    return NextResponse.json(
      { error: "Failed to update highlight status." },
      { status: 500 },
    );
  }
}
