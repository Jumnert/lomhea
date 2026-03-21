import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const awaitedParams = await params;
    const id = awaitedParams.id;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const request = await (prisma as any).placeRequest.findUnique({
      where: { id },
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (request.status !== "PENDING") {
      return NextResponse.json(
        { error: "Request already processed" },
        { status: 400 },
      );
    }

    // Transaction to approve request and create place
    await prisma.$transaction(async (tx) => {
      // 1. Update request status
      await (tx as any).placeRequest.update({
        where: { id },
        data: { status: "APPROVED" },
      });

      // 2. Create the actual place
      // Extract coordinates from googleMapUrl
      let lat = 0;
      let lng = 0;
      let finalUrl = request.googleMapUrl;
      const coordinateRegex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
      let match = finalUrl.match(coordinateRegex);

      if (
        !match &&
        (finalUrl.includes("goo.gl") || finalUrl.includes("t.ly"))
      ) {
        try {
          let currentUrl = finalUrl;
          for (let i = 0; i < 5; i++) {
            const res = await fetch(currentUrl, {
              method: "HEAD",
              redirect: "manual",
            });
            const loc = res.headers.get("location");
            if (!loc) break;
            currentUrl = loc.startsWith("/")
              ? new URL(loc, currentUrl).href
              : loc;
          }
          finalUrl = currentUrl;
          match = finalUrl.match(coordinateRegex);
        } catch (e) {
          console.error("Resolution failed during approval:", e);
        }
      }

      if (match) {
        lat = parseFloat(match[1]);
        lng = parseFloat(match[2]);
      }

      await (tx as any).place.create({
        data: {
          name: request.nameEn,
          nameKh: request.nameKh,
          description: request.description,
          province: request.province,
          category: request.category,
          images: request.images,
          lat,
          lng,
          isVerified: true,
        } as any,
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Approve request error:", error);
    return NextResponse.json(
      { error: "Failed to approve request" },
      { status: 500 },
    );
  }
}
