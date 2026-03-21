const fetch = require("node-fetch");

async function test() {
  const url = "https://maps.app.goo.gl/BmHQzuh7pPGkRRgS9";
  let currentUrl = url;
  let iterations = 0;
  const userAgent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

  console.log(`Starting with: ${currentUrl}`);
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
    console.log(`Iteration ${iterations + 1}: -> ${currentUrl}`);
    iterations++;
  }

  const patterns = [
    /@(-?\d+\.\d+),(-?\d+\.\d+)/,
    /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,
    /!4d(-?\d+\.\d+)!3d(-?\d+\.\d+)/,
    /[?&]query=(-?\d+\.\d+),(-?\d+\.\d+)/,
    /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/,
    /[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/,
  ];

  for (const pattern of patterns) {
    const match = currentUrl.match(pattern);
    if (match) {
      console.log(`Matched pattern ${pattern.source}`);
      console.log(`Lat: ${match[1]}, Lng: ${match[2]}`);
      return;
    }
  }
  console.log("No match found!");
}

test();
