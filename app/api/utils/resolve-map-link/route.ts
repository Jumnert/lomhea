import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. Robust Body Parsing
    let url = "";
    try {
      const body = await req.json();
      url = body.url;
    } catch (e) {
      // Fallback for text/plain
      const text = await req.text();
      try {
        const parsed = JSON.parse(text);
        url = parsed.url;
      } catch (e2) {
        // Last ditch: check if URL is in parameters
        const { searchParams } = new URL(req.url);
        url = searchParams.get("url") || "";
      }
    }

    if (!url)
      return NextResponse.json({ error: "URL is required" }, { status: 400 });

    // Use a Mobile User-Agent (less likely to see bot-checks/consent walls)
    const mobileUA =
      "Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36";

    console.log(`Resolving: ${url}`);

    // 2. Follow redirects with a Mobile UA
    let currentUrl = url;
    let finalHtml = "";
    try {
      const res = await fetch(url, {
        method: "GET",
        redirect: "follow",
        headers: {
          "User-Agent": mobileUA,
          "Accept-Language": "en-US,en;q=0.9",
          Referer: "https://www.google.com/",
        },
      });
      currentUrl = res.url;
      finalHtml = await res.text();
      console.log(`Resolved to: ${currentUrl.substring(0, 100)}...`);
    } catch (e) {
      console.error("Fetch failed:", e);
    }

    // 3. Extraction logic (Same as before but refined)
    // A. URL Check
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

    const urlProto = currentUrl.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    if (urlProto) {
      return NextResponse.json({
        lat: urlProto[1],
        lng: urlProto[2],
        resolvedUrl: currentUrl,
        method: "url_proto",
      });
    }

    // B. Embed Fallback (Very reliable if we have a query)
    const searchParams = new URL(currentUrl).searchParams;
    const q = searchParams.get("q") || searchParams.get("query");
    if (q) {
      const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(q)}&output=embed&hl=en`;
      const embedRes = await fetch(embedUrl, {
        headers: { "User-Agent": mobileUA },
      });
      const embedHtml = await embedRes.text();

      // Exact result match: ["0x...", "Place Name", [lat, lng]]
      const initMatch = embedHtml.match(
        /\["0x[0-9a-f]+:[0-9a-f]+",\s*"[^"]*",\s*\[(-?\d+\.\d+),\s*(-?\d+\.\d+)\]/,
      );
      if (initMatch) {
        return NextResponse.json({
          lat: initMatch[1],
          lng: initMatch[2],
          resolvedUrl: currentUrl,
          method: "embed_init",
        });
      }
    }

    // C. HTML Deep Scan (Protobufs and JSON triplets)
    const triplets = [
      ...finalHtml.matchAll(
        /\[\s*0\s*,\s*(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)\s*\]/g,
      ),
    ];
    for (const t of triplets) {
      const lat = parseFloat(t[2]);
      const lng = parseFloat(t[1]);
      if (lat > 9 && lat < 15 && lng > 102 && lng < 108) {
        const isPP =
          Math.abs(lat - 11.544) < 0.01 || Math.abs(lat - 11.669) < 0.01;
        if (!isPP) {
          return NextResponse.json({
            lat: t[2],
            lng: t[1],
            method: "html_triplet",
          });
        }
      }
    }

    const protos = [...finalHtml.matchAll(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/g)];
    if (protos.length > 0) {
      // Return the first valid one
      for (const p of protos) {
        const lat = parseFloat(p[1]);
        const isPP =
          Math.abs(lat - 11.544) < 0.01 || Math.abs(lat - 11.669) < 0.01;
        if (!isPP)
          return NextResponse.json({
            lat: p[1],
            lng: p[2],
            method: "html_proto",
          });
      }
    }

    // Final strategy: If we have an FTID but no coords, we could log it.
    // For now, return the last fallback or 404
    return NextResponse.json(
      { error: "Resolution failed", resolvedUrl: currentUrl },
      { status: 404 },
    );
  } catch (error) {
    console.error("Resolve Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
