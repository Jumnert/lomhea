import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url)
      return NextResponse.json({ error: "URL is required" }, { status: 400 });

    const userAgent =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

    // Consent cookie to bypass Google's "Before you continue" screen on Vercel US/EU servers
    const consentCookie = "CONSENT=YES+cb.20231205-12-p0.en+FX+908";

    // 1. Follow redirects automatically to get the final URL
    // Standard fetch's "follow" is often more reliable than manual loops on serverless
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent": userAgent,
        Cookie: consentCookie,
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    const currentUrl = res.url;
    const html = await res.text();

    // 2. Extact from URL (The most reliable source)
    // Matches: /place/.../@11.3588601,104.9334971
    const urlAt = currentUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (urlAt) {
      const lat = parseFloat(urlAt[1]);
      const lng = parseFloat(urlAt[2]);
      const isPP =
        Math.abs(lat - 11.544) < 0.005 || Math.abs(lat - 11.669) < 0.005;
      if (!isPP) {
        return NextResponse.json({
          lat: urlAt[1],
          lng: urlAt[2],
          resolvedUrl: currentUrl,
          method: "url_at",
        });
      }
    }

    // Matches: !3d11.3588601!4d104.9334971
    const urlProtoLat = currentUrl.match(/!3d(-?\d+\.\d+)/);
    const urlProtoLng = currentUrl.match(/!4d(-?\d+\.\d+)/);
    if (urlProtoLat && urlProtoLng) {
      return NextResponse.json({
        lat: urlProtoLat[1],
        lng: urlProtoLng[1],
        resolvedUrl: currentUrl,
        method: "url_proto",
      });
    }

    // 3. Strategy: EMBED Fallback (For shared SEARCH links)
    const searchParams = new URL(currentUrl).searchParams;
    const query = searchParams.get("q") || searchParams.get("query");

    if (query) {
      const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed&hl=en`;
      const embedRes = await fetch(embedUrl, {
        headers: { "User-Agent": userAgent, Cookie: consentCookie },
      });
      const embedHtml = await embedRes.text();

      // Pattern: Detailed place info with coordinates
      // ["0x...", "Place Name", [lat, lng], ... ]
      const initEmbedResult = embedHtml.match(
        /\["0x[0-9a-f]+:[0-9a-f]+",\s*"[^"]*",\s*\[(-?\d+\.\d+),\s*(-?\d+\.\d+)\]/,
      );
      if (initEmbedResult) {
        return NextResponse.json({
          lat: initEmbedResult[1],
          lng: initEmbedResult[2],
          resolvedUrl: currentUrl,
          scraped: true,
          method: "embed_init",
        });
      }

      // Broad scan for any [lat, lng] inside the search result page
      const broadScan = [
        ...embedHtml.matchAll(/\[(-?\d+\.\d+),\s*(-?\d+\.\d+)\]/g),
      ];
      for (const match of broadScan) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        if (lat > 9 && lat < 15 && lng > 102 && lng < 108) {
          const isPP =
            Math.abs(lat - 11.544) < 0.005 || Math.abs(lat - 11.669) < 0.005;
          if (!isPP) {
            return NextResponse.json({
              lat: match[1],
              lng: match[2],
              resolvedUrl: currentUrl,
              scraped: true,
              method: "embed_broad",
            });
          }
        }
      }
    }

    // 4. Final Fallback: Deep Scrape the HTML for protobufs
    const deepLats = [...html.matchAll(/!3d(-?\d+\.\d+)/g)].map((m) => m[1]);
    const deepLngs = [...html.matchAll(/(!4d|!2d)(-?\d+\.\d+)/g)].map(
      (m) => m[2],
    );
    for (let i = 0; i < Math.min(deepLats.length, deepLngs.length); i++) {
      const lat = parseFloat(deepLats[i]);
      const lng = parseFloat(deepLngs[i]);
      if (lat > 9.5 && lat < 15 && lng > 102 && lng < 108) {
        const isPP = Math.abs(lat - 11.544) < 0.005;
        if (!isPP) {
          return NextResponse.json({
            lat: deepLats[i],
            lng: deepLngs[i],
            resolvedUrl: currentUrl,
            method: "html_proto",
          });
        }
      }
    }

    return NextResponse.json({ error: "Resolution failed" }, { status: 404 });
  } catch (error) {
    console.error("Resolve Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
