const fetch = require("node-fetch");

async function test(url) {
  let currentUrl = url;
  let iterations = 0;
  // iPhone User Agent
  const userAgent =
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1";

  console.log(`\nTesting: ${url}`);
  while (iterations < 10) {
    const res = await fetch(currentUrl, {
      method: "GET", // Use GET for mobile logic
      redirect: "manual",
      headers: {
        "User-Agent": userAgent,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    const location = res.headers.get("location");
    if (!location) {
      // Check body for meta refresh if no location header
      const body = await res.text();
      const metaMatch =
        body.match(/url='([^']+)'/i) ||
        body.match(/window\.location\.replace\("([^"]+)"\)/);
      if (metaMatch) {
        const next = metaMatch[1].replace(/\\x3d/g, "=").replace(/\\x26/g, "&");
        currentUrl = next.startsWith("/")
          ? new URL(next, currentUrl).href
          : next;
      } else {
        break;
      }
    } else {
      currentUrl = location.startsWith("/")
        ? new URL(location, currentUrl).href
        : location;
    }
    console.log(`Iteration ${iterations + 1}: ${currentUrl}`);
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
      console.log(`Matched: ${pattern.source}`);
      console.log(`Lat: ${match[1]}, Lng: ${match[2]}`);
      return;
    }
  }
  console.log("No match found!");
}

(async () => {
  await test("https://maps.app.goo.gl/gdyxDQ3u7VdLx42J7?g_st=ic");
  await test("https://maps.app.goo.gl/UPXMuiqmpKnuj9kQ6");
})();
