import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher";
import { sendPushNotification } from "@/lib/push-notification";

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

      // 2. Create the actual place — extract coordinates
      // !3d = lat, !4d = lng (actual pin). @lat,lng is just viewport center.
      let lat = 0;
      let lng = 0;
      let finalUrl = request.googleMapUrl;

      const extractCoords = (url: string) => {
        const latM = url.match(/!3d(-?\d+\.\d+)/);
        const lngM = url.match(/!4d(-?\d+\.\d+)/);
        if (latM && lngM)
          return { lat: parseFloat(latM[1]), lng: parseFloat(lngM[1]) };
        const atM = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (atM) return { lat: parseFloat(atM[1]), lng: parseFloat(atM[2]) };
        const qM = url.match(/[?&](?:query|q|ll)=(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (qM) return { lat: parseFloat(qM[1]), lng: parseFloat(qM[2]) };
        return null;
      };

      const direct = extractCoords(finalUrl);
      if (direct) {
        lat = direct.lat;
        lng = direct.lng;
      }

      if (
        !lat &&
        !lng &&
        (finalUrl.includes("goo.gl") || finalUrl.includes("maps.app.goo.gl"))
      ) {
        try {
          let currentUrl = finalUrl;
          const userAgent =
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
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
          finalUrl = currentUrl;
          const resolved = extractCoords(finalUrl);
          if (resolved) {
            lat = resolved.lat;
            lng = resolved.lng;
          }
        } catch (e) {
          console.error("Resolution failed during approval:", e);
        }
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
          googleMapUrl: request.googleMapUrl,
        } as any,
      });

      // 3. Create Notification
      await (tx as any).notification.create({
        data: {
          userId: request.userId,
          title: "Location Approved! 🎉",
          message: `Your suggestion for "${request.nameEn}" has been approved and added to the map.`,
          type: "APPROVE",
          link: `/`, // Link to map
        },
      });
    });

    // 4. Trigger pusher — notify user AND broadcast map update
    await pusherServer.trigger(
      `notifications-${request.userId}`,
      "new-notification",
      {
        title: "Location Approved! 🎉",
        message: `Your suggestion for "${request.nameEn}" has been approved and added to the map.`,
      },
    );

    // Broadcast to all clients so the map auto-refreshes
    await pusherServer.trigger("places", "places-updated", {});

    // 5. Trigger Web Push (Mobile/Desktop background)
    await sendPushNotification(request.userId, {
      title: "Lomhea: Suggestion Approved!",
      body: `Excellent! Your place "${request.nameEn}" is now live on the map.`,
      url: "/",
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
