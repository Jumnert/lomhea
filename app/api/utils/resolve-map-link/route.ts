import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url)
      return NextResponse.json({ error: "URL is required" }, { status: 400 });

    const userAgent =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

    // 1. Follow redirects to getting the "Final" Google Maps URL
    let currentUrl = url;
    let iterations = 0;
    while (iterations < 10) {
      const res = await fetch(currentUrl, {
        method: "HEAD",
        redirect: "manual",
        headers: { "User-Agent": userAgent },
      });
      const location = res.headers.get("location");
      if (!location) {
        // Try GET if HEAD fails to redirect
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

    // 2. Strategy A: Check URL for direct coordinates (The most accurate)
    const directLat = currentUrl.match(/!3d(-?\d+\.\d+)/);
    const directLng = currentUrl.match(/!4d(-?\d+\.\d+)/);
    if (directLat && directLng) {
      return NextResponse.json({
        lat: directLat[1],
        lng: directLng[1],
        resolvedUrl: currentUrl,
        method: "url_protobuf",
      });
    }

    const viewportMatch = currentUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (viewportMatch) {
      const lat = parseFloat(viewportMatch[1]);
      const lng = parseFloat(viewportMatch[2]);
      // Avoid Phnom Penh default if possible, but better than nothing
      const isPP = Math.abs(lat - 11.544) < 0.005;
      if (!isPP) {
        return NextResponse.json({
          lat: viewportMatch[1],
          lng: viewportMatch[2],
          resolvedUrl: currentUrl,
          method: "url_viewport",
        });
      }
    }

    // 3. Strategy B: EMBED Fallback (High reliability for search results)
    // If it's a search URL or we haven't found good coords yet, try the embed endpoint
    try {
      const searchUrl = new URL(currentUrl);
      const query =
        searchUrl.searchParams.get("q") || searchUrl.searchParams.get("query");

      if (query) {
        const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
        const embedRes = await fetch(embedUrl, {
          headers: { "User-Agent": userAgent },
        });
        const embedHtml = await embedRes.text();

        // Embed pages often contain coordinates in a simple [lat, lng] array in scripts
        const embedCoords = embedHtml.match(/(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (embedCoords) {
          const lat = parseFloat(embedCoords[1]);
          const lng = parseFloat(embedCoords[2]);
          // Bounds check for Cambodia
          if (lat > 9 && lat < 15 && lng > 102 && lng < 108) {
            const isPP = Math.abs(lat - 11.544) < 0.005;
            if (!isPP) {
              return NextResponse.json({
                lat: embedCoords[1],
                lng: embedCoords[2],
                resolvedUrl: currentUrl,
                scraped: true,
                method: "embed_scan",
              });
            }
          }
        }
      }
    } catch (e) {
      console.error("Embed fallback failed:", e);
    }

    // 4. Strategy C: Deep Scrape the original page
    try {
      const pageRes = await fetch(currentUrl, {
        headers: { "User-Agent": userAgent },
      });
      const html = await pageRes.text();

      const candidates: { lat: string; lng: string; method: string }[] = [];

      // Look for !3d/!4d pairs
      const lRegex = /!3d(-?\d+\.\d+)/g;
      const lnRegex = /!4d(-?\d+\.\d+)/g;
      let m;
      const lats = [];
      const lngs = [];
      while ((m = lRegex.exec(html))) lats.push(m[1]);
      while ((m = lnRegex.exec(html))) lngs.push(m[1]);
      for (let i = 0; i < Math.min(lats.length, lngs.length); i++) {
        candidates.push({
          lat: lats[i],
          lng: lngs[i],
          method: "html_protobuf",
        });
      }

      // Look for triplets [0, lng, lat]
      const triplets = html.matchAll(
        /\[\s*0\s*,\s*(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)\s*\]/g,
      );
      for (const t of triplets) {
        candidates.push({ lat: t[2], lng: t[1], method: "html_triplet" });
      }

      for (const cand of candidates) {
        const lat = parseFloat(cand.lat);
        const lng = parseFloat(cand.lng);
        if (lat > 9 && lat < 15 && lng > 102 && lng < 108) {
          const isPP = Math.abs(lat - 11.544) < 0.005;
          if (!isPP) {
            return NextResponse.json({
              lat: cand.lat,
              lng: cand.lng,
              resolvedUrl: currentUrl,
              scraped: true,
              method: cand.method,
            });
          }
        }
      }
    } catch (e) {
      console.error("Deep scrape failed:", e);
    }

    return NextResponse.json({ error: "Resolution failed" }, { status: 404 });
  } catch (error) {
    console.error("Resolve Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
