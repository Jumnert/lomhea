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
          const patterns = [
            /@(-?\d+\.\d+),(-?\d+\.\d+)/,
            /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,
            /!4d(-?\d+\.\d+)!3d(-?\d+\.\d+)/,
            /[?&]query=(-?\d+\.\d+),(-?\d+\.\d+)/,
            /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/,
            /[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/,
          ];

          let match = null;
          let matchedPattern = "";
          for (const pattern of patterns) {
            match = finalUrl.match(pattern);
            if (match) {
              matchedPattern = pattern.source;
              break;
            }
          }

          if (
            !match &&
            (finalUrl.includes("goo.gl") ||
              finalUrl.includes("t.ly") ||
              finalUrl.includes("maps.app.goo.gl"))
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
                  // Try GET if HEAD fails
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
              for (const pattern of patterns) {
                match = finalUrl.match(pattern);
                if (match) {
                  matchedPattern = pattern.source;
                  break;
                }
              }

              // Scraping fallback if still no match in URL
              if (!match) {
                const pageRes = await fetch(finalUrl, {
                  headers: { "User-Agent": userAgent },
                });
                const html = await pageRes.text();
                const bodyPatterns = [
                  /\[(-?\d+\.\d+),(-?\d+\.\d+)\]/,
                  /"lat":(-?\d+\.\d+),"lng":(-?\d+\.\d+)/,
                ];
                for (const p of bodyPatterns) {
                  const m = html.match(p);
                  if (m) {
                    const scrapLat = parseFloat(m[1]);
                    const scrapLng = parseFloat(m[2]);
                    if (Math.abs(scrapLat) > 1 && Math.abs(scrapLng) > 1) {
                      lat = scrapLat;
                      lng = scrapLng;
                      break;
                    }
                  }
                }
              }
            } catch (e) {
              console.error("Auto-approval resolution failed:", e);
            }
          }

          if (match) {
            if (
              matchedPattern.includes("!4d(-?\\d+\\.\\d+)!3d(-?\\d+\\.\\d+)")
            ) {
              lat = parseFloat(match[2]);
              lng = parseFloat(match[1]);
            } else {
              lat = parseFloat(match[1]);
              lng = parseFloat(match[2]);
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
