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

    // 2. Coordinate Extraction
    // !3d = latitude, !4d = longitude — the ACTUAL pin (most precise)
    // @lat,lng = viewport/camera center — can be several km off
    const latMatch = currentUrl.match(/!3d(-?\d+\.\d+)/);
    const lngMatch = currentUrl.match(/!4d(-?\d+\.\d+)/);
    if (latMatch && lngMatch) {
      return NextResponse.json({
        lat: latMatch[1],
        lng: lngMatch[1],
        resolvedUrl: currentUrl,
      });
    }

    // Fallback patterns (less precise)
    const fallbackPatterns = [
      { re: /@(-?\d+\.\d+),(-?\d+\.\d+)/, swap: false }, // viewport center
      { re: /[?&]query=(-?\d+\.\d+),(-?\d+\.\d+)/, swap: false },
      { re: /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/, swap: false },
      { re: /[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/, swap: false },
    ];
    for (const { re, swap } of fallbackPatterns) {
      const match = currentUrl.match(re);
      if (match) {
        return NextResponse.json({
          lat: swap ? match[2] : match[1],
          lng: swap ? match[1] : match[2],
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

      // In page HTML, also try extracting !3d/!4d independently
      const htmlLatMatch = html.match(/!3d(-?\d+\.\d+)/);
      const htmlLngMatch = html.match(/!4d(-?\d+\.\d+)/);
      if (htmlLatMatch && htmlLngMatch) {
        return NextResponse.json({
          lat: htmlLatMatch[1],
          lng: htmlLngMatch[1],
          resolvedUrl: currentUrl,
          scraped: true,
        });
      }

      // Last resort: @lat,lng from HTML (viewport center)
      const atMatch = html.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (atMatch) {
        const lat = parseFloat(atMatch[1]);
        const lng = parseFloat(atMatch[2]);
        if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
          return NextResponse.json({
            lat: atMatch[1],
            lng: atMatch[2],
            resolvedUrl: currentUrl,
            scraped: true,
          });
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
