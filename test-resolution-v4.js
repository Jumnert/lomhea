const fetch = require("node-fetch");

async function test(url) {
  let currentUrl = url;
  let iterations = 0;
  const userAgent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

  console.log(`\nTesting: ${url}`);
  while (iterations < 10) {
    const res = await fetch(currentUrl, {
      method: "GET",
      redirect: "manual",
      headers: { "User-Agent": userAgent },
    });
    const location = res.headers.get("location");
    if (!location) {
      break;
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
  await test("https://maps.app.goo.gl/gdyxDQ3u7VdLx42J7"); // Without ?g_st=ic
  await test("https://maps.app.goo.gl/gdyxDQ3u7VdLx42J7?g_st=ic");
})();
