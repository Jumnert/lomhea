import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url)
      return NextResponse.json({ error: "URL is required" }, { status: 400 });

    const userAgent =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

    // 1. Follow redirects
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

    // 2. Direct Protobuf Search
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

    // 3. Strategy: EMBED Fetch (The most reliable for shared searches)
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

        const candidates: { lat: string; lng: string; method: string }[] = [];

        // Pattern: [ "0x...", "Place Name", [lat, lng], ... ] (Very reliable in initEmbed)
        const initEmbedResult = embedHtml.match(
          /\["0x[0-9a-f]+:[0-9a-f]+",\s*"[^"]*",\s*\[(-?\d+\.\d+),\s*(-?\d+\.\d+)\]/,
        );
        if (initEmbedResult) {
          candidates.push({
            lat: initEmbedResult[1],
            lng: initEmbedResult[2],
            method: "embed_initembed",
          });
        }

        // Broad scan for any [lat, lng] pairs in the HTML
        const broadScan = embedHtml.matchAll(
          /\[(-?\d+\.\d+),\s*(-?\d+\.\d+)\]/g,
        );
        for (const match of broadScan) {
          candidates.push({
            lat: match[1],
            lng: match[2],
            method: "embed_broad",
          });
          candidates.push({
            lat: match[2],
            lng: match[1],
            method: "embed_broad_reverse",
          });
        }

        for (const cand of candidates) {
          const lat = parseFloat(cand.lat);
          const lng = parseFloat(cand.lng);
          if (lat > 9.5 && lat < 15 && lng > 102 && lng < 108) {
            // Improved Blacklist: Specifically avoid the "Default Phnom Penh Viewport"
            // Google often provides 11.5 ... or 11.66 as city defaults
            const isPPDefault =
              Math.abs(lat - 11.544) < 0.005 || Math.abs(lat - 11.669) < 0.005;

            if (!isPPDefault) {
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
      }
    } catch (e) {
      console.error("Embed fallback failed:", e);
    }

    // 4. Final Fallback (deep scrape)
    try {
      const pageRes = await fetch(currentUrl, {
        headers: { "User-Agent": userAgent },
      });
      const html = await pageRes.text();

      // Look for !3d/!4d pairs
      const lats = [];
      const lngs = [];
      const latM = html.matchAll(/!3d(-?\d+\.\d+)/g);
      const lngM = html.matchAll(/!4d(-?\d+\.\d+)/g);
      for (const m of latM) lats.push(m[1]);
      for (const m of lngM) lngs.push(m[1]);

      for (let i = 0; i < Math.min(lats.length, lngs.length); i++) {
        const lat = parseFloat(lats[i]);
        const lng = parseFloat(lngs[i]);
        if (lat > 9.5 && lat < 15 && lng > 102 && lng < 108) {
          if (Math.abs(lat - 11.544) > 0.005) {
            return NextResponse.json({
              lat: lats[i],
              lng: lngs[i],
              resolvedUrl: currentUrl,
              scraped: true,
              method: "deep_protobuf",
            });
          }
        }
      }
    } catch (e) {}

    return NextResponse.json({ error: "Resolution failed" }, { status: 404 });
  } catch (error) {
    console.error("Resolve Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
