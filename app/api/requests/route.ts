import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// GET - fetch current user's requests
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const requests = await (prisma as any).placeRequest.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(requests);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
