// Run with: node debug-coord.mjs <google-maps-url>
// e.g. node debug-coord.mjs "https://maps.app.goo.gl/abc123"

const url = process.argv[2];
if (!url) {
  console.error("Pass a Google Maps URL as argument");
  process.exit(1);
}

const userAgent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

let currentUrl = url;
let iterations = 0;

console.log("\n=== FOLLOWING REDIRECTS ===");
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
    if (!getLoc) {
      console.log("No more redirects.");
      break;
    }
    currentUrl = getLoc.startsWith("/")
      ? new URL(getLoc, currentUrl).href
      : getLoc;
  } else {
    currentUrl = location.startsWith("/")
      ? new URL(location, currentUrl).href
      : location;
  }
  console.log(`[${iterations + 1}] ${currentUrl}`);
  iterations++;
}

console.log("\n=== FINAL URL ===\n" + currentUrl);

const patterns = [
  {
    label: "!3d(lat)!4d(lng) — ACTUAL PIN",
    re: /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,
    swap: false,
  },
  {
    label: "!4d(lng)!3d(lat) — ACTUAL PIN reversed",
    re: /!4d(-?\d+\.\d+)!3d(-?\d+\.\d+)/,
    swap: true,
  },
  {
    label: "@lat,lng — VIEWPORT CENTER",
    re: /@(-?\d+\.\d+),(-?\d+\.\d+)/,
    swap: false,
  },
  {
    label: "?query=lat,lng",
    re: /[?&]query=(-?\d+\.\d+),(-?\d+\.\d+)/,
    swap: false,
  },
  { label: "?q=lat,lng", re: /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/, swap: false },
  { label: "?ll=lat,lng", re: /[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/, swap: false },
];

console.log("\n=== PATTERN MATCHES IN URL ===");
let found = false;
for (const { label, re, swap } of patterns) {
  const match = currentUrl.match(re);
  if (match) {
    const lat = swap ? match[2] : match[1];
    const lng = swap ? match[1] : match[2];
    console.log(`✅ ${label}`);
    console.log(`   RAW: match[1]=${match[1]}, match[2]=${match[2]}`);
    console.log(`   → lat=${lat}, lng=${lng}`);
    if (!found) {
      console.log("   ^^^^ THIS IS WHAT GETS USED ^^^^");
      found = true;
    }
  }
}
if (!found) console.log("❌ No URL pattern matched.");
