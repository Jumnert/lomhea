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

    const body = await req.json();
    const {
      nameEn,
      nameKh,
      province,
      category,
      googleMapUrl,
      description,
      reason,
      images,
    } = body;

    const request = await (prisma as any).placeRequest.create({
      data: {
        userId: session.user.id,
        nameEn,
        nameKh,
        province,
        category,
        googleMapUrl,
        description,
        reason,
        images,
        status: "PENDING",
      },
    });

    return NextResponse.json(request);
  } catch (error) {
    console.error("Submit request error:", error);
    return NextResponse.json(
      { error: "Failed to submit request" },
      { status: 500 },
    );
  }
}
