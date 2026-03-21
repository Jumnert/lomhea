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
          let currentUrl = googleMapUrl;
          const userAgent =
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

          const extractCoords = (url: string) => {
            const latM = url.match(/!3d(-?\d+\.\d+)/);
            const lngM = url.match(/!4d(-?\d+\.\d+)/);
            if (latM && lngM)
              return { lat: parseFloat(latM[1]), lng: parseFloat(lngM[1]) };
            const atM = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
            if (atM)
              return { lat: parseFloat(atM[1]), lng: parseFloat(atM[2]) };
            const qM = url.match(
              /[?&](?:query|q|ll)=(-?\d+\.\d+),(-?\d+\.\d+)/,
            );
            if (qM) return { lat: parseFloat(qM[1]), lng: parseFloat(qM[2]) };
            return null;
          };

          const direct = extractCoords(currentUrl);
          if (direct) {
            lat = direct.lat;
            lng = direct.lng;
          }

          if (
            !lat &&
            !lng &&
            (currentUrl.includes("goo.gl") ||
              currentUrl.includes("maps.app.goo.gl"))
          ) {
            try {
              for (let i = 0; i < 5; i++) {
                const res = await fetch(currentUrl, {
                  method: "HEAD",
                  redirect: "manual",
                  headers: { "User-Agent": userAgent },
                });
                const loc = res.headers.get("location");
                if (!loc) {
                  const getRes = await fetch(currentUrl, {
                    method: "GET",
                    redirect: "manual",
                    headers: { "User-Agent": userAgent },
                  });
                  const getLoc = getRes.headers.get("location");
                  if (!getLoc) break;
                  currentUrl = getLoc.startsWith("/")
                    ? new URL(getLoc, currentUrl).href
                    : getLoc;
                } else {
                  currentUrl = loc.startsWith("/")
                    ? new URL(loc, currentUrl).href
                    : loc;
                }
              }
              const resolved = extractCoords(currentUrl);
              if (resolved) {
                lat = resolved.lat;
                lng = resolved.lng;
              }
            } catch (e) {
              console.error("Auto-approval resolution failed:", e);
            }
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

      // Broadcast map update
      await pusherServer.trigger("places", "places-updated", {});

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
