import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reports = await prisma.report.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    const userIds = [...new Set(reports.map((r) => r.userId).filter(Boolean))];
    const placeIds = [...new Set(reports.map((r) => r.placeId).filter(Boolean))];

    const [users, places] = await Promise.all([
      prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, image: true },
      }),
      prisma.place.findMany({
        where: { id: { in: placeIds } },
        select: { id: true, name: true },
      }),
    ]);

    const userMap = new Map(users.map((u) => [u.id, u]));
    const placeMap = new Map(places.map((p) => [p.id, p]));

    const result = reports.map((report) => ({
      ...report,
      user: userMap.get(report.userId) || null,
      place: placeMap.get(report.placeId) || null,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Fetch reports error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 },
    );
  }
}
