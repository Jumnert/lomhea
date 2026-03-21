import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url)
      return NextResponse.json({ error: "URL is required" }, { status: 400 });

    // 1. Follow redirects
    let currentUrl = url;
    let iterations = 0;
    while (iterations < 5) {
      const res = await fetch(currentUrl, {
        method: "HEAD",
        redirect: "manual",
      });
      const location = res.headers.get("location");
      if (!location) break;
      currentUrl = location.startsWith("/")
        ? new URL(location, currentUrl).href
        : location;
      iterations++;
    }

    // 2. Comprehensive Coordinate Extraction
    const patterns = [
      /@(-?\d+\.\d+),(-?\d+\.\d+)/, // standard @lat,lng
      /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/, // google !3d (lat) !4d (lng)
      /!4d(-?\d+\.\d+)!3d(-?\d+\.\d+)/, // reverse !4d (lng) !3d (lat)
      /[?&]query=(-?\d+\.\d+),(-?\d+\.\d+)/, // query params (mobile)
      /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/, // q param (mobile)
      /[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/, // ll param
    ];

    for (const pattern of patterns) {
      const match = currentUrl.match(pattern);
      if (match) {
        // Special case for reverse order
        if (pattern.source.includes("!4d(-?\\d+\\.\\d+)!3d(-?\\d+\\.\\d+)")) {
          return NextResponse.json({
            lat: match[2],
            lng: match[1],
            resolvedUrl: currentUrl,
          });
        }
        return NextResponse.json({
          lat: match[1],
          lng: match[2],
          resolvedUrl: currentUrl,
        });
      }
    }

    return NextResponse.json(
      {
        error: "Could not extract coordinates from resolved URL",
        resolvedUrl: currentUrl,
      },
      { status: 404 },
    );
  } catch (error) {
    console.error("Link resolution error:", error);
    return NextResponse.json(
      { error: "Failed to resolve link" },
      { status: 500 },
    );
  }
}
