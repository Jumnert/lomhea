import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    let url = "";
    try {
      const body = await req.json();
      url = body.url;
    } catch (e) {
      const text = await req.text();
      try {
        const parsed = JSON.parse(text);
        url = parsed.url;
      } catch (e2) {
        return NextResponse.json(
          { error: "Invalid request body" },
          { status: 400 },
        );
      }
    }

    if (!url)
      return NextResponse.json({ error: "URL is required" }, { status: 400 });

    const mobileUA =
      "Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36";

    // 1. Follow Redirects to the end
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
    } catch (e) {
      console.error("Fetch failure:", e);
    }

    // Extraction helper
    const isCambodia = (lat: number, lng: number) =>
      lat > 9.5 && lat < 15 && lng > 102 && lng < 108;
    const isCityCenter = (lat: number, lng: number) => {
      // Broaden city center filter to include common fallback area
      const pp =
        Math.abs(lat - 11.544) < 0.005 && Math.abs(lng - 104.89) < 0.005;
      const pp2 =
        Math.abs(lat - 11.669) < 0.005 && Math.abs(lng - 104.93) < 0.005;
      const pp3 = Math.abs(lat - 11.56) < 0.01 && Math.abs(lng - 104.91) < 0.01;
      return pp || pp2 || pp3;
    };

    const candidates: { lat: string; lng: string; method: string }[] = [];

    // Strategy A: URL check
    const urlMatches = [
      currentUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/),
      currentUrl.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/),
    ];
    for (const m of urlMatches) {
      if (m) candidates.push({ lat: m[1], lng: m[2], method: "url_param" });
    }

    // Strategy B: EMBED check
    const searchParams = new URL(currentUrl).searchParams;
    const q = searchParams.get("q") || searchParams.get("query");
    if (q) {
      const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(q)}&output=embed&hl=en`;
      const embedRes = await fetch(embedUrl, {
        headers: { "User-Agent": mobileUA },
      });
      const embedHtml = await embedRes.text();

      // Match 1: Named initEmbed entry
      const initMatch = embedHtml.match(
        /\["0x[0-9a-f]+:[0-9a-f]+",\s*"[^"]*",\s*\[(-?\d+\.\d+),\s*(-?\d+\.\d+)\]/,
      );
      if (initMatch)
        candidates.push({
          lat: initMatch[1],
          lng: initMatch[2],
          method: "embed_init",
        });

      // Match 2: Broad lat,lng text scan (Plus Codes often look like this)
      const textMatches = [
        ...embedHtml.matchAll(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/g),
      ];
      for (const m of textMatches) {
        candidates.push({ lat: m[1], lng: m[2], method: "embed_text_scan" });
      }
    }

    // Strategy C: HTML deep scan
    const htmlMatches = [
      ...finalHtml.matchAll(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/g),
      ...finalHtml.matchAll(
        /\[\s*0\s*,\s*(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)\s*\]/g,
      ),
      ...finalHtml.matchAll(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/g),
    ];
    for (const m of htmlMatches) {
      if (m[2] && m[1]) {
        // Some patterns are [lng, lat], some are [lat, lng]. We'll test both later.
        candidates.push({ lat: m[1], lng: m[2], method: "html_pair_A" });
        candidates.push({ lat: m[2], lng: m[1], method: "html_pair_B" });
      }
    }

    // Select the best candidate
    for (const cand of candidates) {
      const lat = parseFloat(cand.lat);
      const lng = parseFloat(cand.lng);
      if (isCambodia(lat, lng) && !isCityCenter(lat, lng)) {
        return NextResponse.json({
          lat: cand.lat,
          lng: cand.lng,
          resolvedUrl: currentUrl,
          method: cand.method,
        });
      }
    }

    // Final Fallback: If we only found Phnom Penh, return it instead of 404
    const anyPP = candidates.find((c) =>
      isCambodia(parseFloat(c.lat), parseFloat(c.lng)),
    );
    if (anyPP) {
      return NextResponse.json({
        lat: anyPP.lat,
        lng: anyPP.lng,
        resolvedUrl: currentUrl,
        method: anyPP.method + "_fallback",
      });
    }

    return NextResponse.json(
      { error: "Resolution failed", resolvedUrl: currentUrl },
      { status: 404 },
    );
  } catch (error) {
    console.error("Resolve Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
