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

    // 2. Extract from coordinates
    const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match = currentUrl.match(regex);
    if (match) {
      return NextResponse.json({
        lat: match[1],
        lng: match[2],
        resolvedUrl: currentUrl,
      });
    }

    // 3. Fallback: Check if it's already in the final URL but different format?
    // Sometimes it's !3d11.55!4d104.91
    const regexAlt = /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/;
    const matchAlt = currentUrl.match(regexAlt);
    if (matchAlt) {
      return NextResponse.json({
        lat: matchAlt[1],
        lng: matchAlt[2],
        resolvedUrl: currentUrl,
      });
    }

    return NextResponse.json(
      { error: "Could not extract coordinates from resolved URL" },
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
