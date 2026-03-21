import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher";

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
      lat: bodyLat,
      lng: bodyLng,
    } = body;

    const isAdminOrMod =
      (session.user as any).role === "ADMIN" ||
      (session.user as any).role === "MODERATOR";

    if (isAdminOrMod) {
      // Auto-approve and create Place immediately
      const request = await prisma.$transaction(async (tx) => {
        const reqResult = await (tx as any).placeRequest.create({
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
            status: "APPROVED",
          },
        });

        // Resolve coordinates
        let lat = bodyLat ? parseFloat(bodyLat) : 0;
        let lng = bodyLng ? parseFloat(bodyLng) : 0;

        if (lat === 0 && lng === 0) {
          let finalUrl = googleMapUrl;
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
              console.error("Auto-approval resolution failed:", e);
            }
          }

          if (match) {
            lat = parseFloat(match[1]);
            lng = parseFloat(match[2]);
          }
        }

        await (tx as any).place.create({
          data: {
            name: nameEn,
            nameKh: nameKh,
            description: description,
            province: province,
            category: category,
            images: images,
            lat,
            lng,
            isVerified: true,
          },
        });

        // Create Notification
        await (tx as any).notification.create({
          data: {
            userId: session.user.id,
            title: "Published Automatically! 🎉",
            message: `Your suggestion for "${nameEn}" has been auto-approved as you are an ${session.user.role}.`,
            type: "APPROVE",
          },
        });

        return reqResult;
      });

      // Trigger pusher
      await pusherServer.trigger(
        `notifications-${session.user.id}`,
        "new-notification",
        {
          title: "Published Automatically! 🎉",
          message: `Your suggestion for "${nameEn}" has been auto-approved.`,
        },
      );

      return NextResponse.json(request);
    }

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
