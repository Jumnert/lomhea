import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";

function isValidMd5(md5: string) {
  return /^[a-fA-F0-9]{32}$/.test(md5);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const md5 = body?.md5 as string | undefined;

    if (!md5 || !isValidMd5(md5)) {
      return NextResponse.json({ error: "Invalid md5" }, { status: 400 });
    }

    const place = await (prisma.place as any).findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!place) {
      return NextResponse.json({ error: "Place not found" }, { status: 404 });
    }

    const featuredDurationDays = 30;
    const updated = await (prisma.place as any).update({
      where: { id },
      data: {
        isFeatured: true,
        featuredUntil: new Date(
          Date.now() + featuredDurationDays * 24 * 60 * 60 * 1000,
        ),
      },
      select: {
        id: true,
        name: true,
        isFeatured: true,
        featuredUntil: true,
      },
    });

    await pusherServer.trigger("places", "places-updated", {});

    return NextResponse.json({
      success: true,
      place: updated,
      md5,
    });
  } catch (error) {
    console.error("Feature place route error:", error);
    if (
      error instanceof Error &&
      error.message.toLowerCase().includes("isfeatured")
    ) {
      return NextResponse.json(
        {
          error:
            "Database is not migrated yet. Add Place.isFeatured and Place.featuredUntil columns first.",
        },
        { status: 500 },
      );
    }
    return NextResponse.json(
      { error: "Failed to activate featured place" },
      { status: 500 },
    );
  }
}
