import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { placeId, reason, details } = await req.json();

    if (!placeId || !reason) {
      return NextResponse.json(
        { error: "Place and reason are required" },
        { status: 400 },
      );
    }

    const report = await (prisma as any).report.create({
      data: {
        userId: session.user.id,
        placeId,
        reason,
        details,
        status: "PENDING",
      },
    });

    return NextResponse.json(report);
  } catch (error) {
    console.error("Create report error:", error);
    return NextResponse.json(
      { error: "Failed to submit report" },
      { status: 500 },
    );
  }
}
