import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url)
      return NextResponse.json({ error: "URL is required" }, { status: 400 });

    // 1. Follow redirects with a browser-like User-Agent
    let currentUrl = url;
    let iterations = 0;
    const userAgent =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

    while (iterations < 10) {
      const res = await fetch(currentUrl, {
        method: "HEAD",
        redirect: "manual",
        headers: { "User-Agent": userAgent },
      });

      const location = res.headers.get("location");
      if (!location) {
        // If HEAD fails to provide a location, try a GET (some shortlinks require it)
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
        currentUrl = location.startsWith("/")
          ? new URL(location, currentUrl).href
          : location;
      }
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

    // 3. Last Resort: Scrape from the page content (e.g. for Search result pages)
    try {
      const pageRes = await fetch(currentUrl, {
        headers: { "User-Agent": userAgent },
      });
      const html = await pageRes.text();

      // Look for [lat, lng] in the body - specifically for Google Maps initialization states
      // Pattern: comma separated decimals inside brackets, often seen in window.APP_STATE
      const bodyPatterns = [
        /\[(-?\d+\.\d+),(-?\d+\.\d+)\]/, // [lat,lng]
        /"lat":(-?\d+\.\d+),"lng":(-?\d+\.\d+)/, // JSON {lat:x, lng:y}
        /center=(-?\d+\.\d+)%2C(-?\d+\.\d+)/, // query param in body
      ];

      for (const pattern of bodyPatterns) {
        const match = html.match(pattern);
        if (match) {
          // Verify it's not a generic small number (like 0.1, 1.0 etc)
          const lat = parseFloat(match[1]);
          const lng = parseFloat(match[2]);

          // Simple bounds check for Cambodia (roughly 9 N to 15 N, 102 E to 108 E)
          // or more generally if it's a non-zero coordinate
          if (Math.abs(lat) > 1 && Math.abs(lng) > 1) {
            return NextResponse.json({
              lat: match[1],
              lng: match[2],
              resolvedUrl: currentUrl,
              scraped: true,
            });
          }
        }
      }
    } catch (e) {
      console.error("Scraping failed:", e);
    }

    return NextResponse.json(
      {
        error: "Could not extract coordinates from resolved URL or page body",
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
