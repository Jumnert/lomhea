// Run with: node debug-coord.mjs <google-maps-url>
// e.g. node debug-coord.mjs "https://maps.app.goo.gl/hog4vhUFfPB1SpfU7?g_st=ic"

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

console.log("\n=== SCRAPING HTML ===");
const pageRes = await fetch(currentUrl, {
  headers: { "User-Agent": userAgent },
});
const html = await pageRes.text();

const candidates = [];

// Method 0: Login Continue
const loginMatch = html.match(/ServiceLogin\?.*?continue=([^"& ]+)/);
if (loginMatch) {
  const decodedContinue = decodeURIComponent(loginMatch[1]);
  console.log("Found Login Redirect URL!");
  const subLat = decodedContinue.match(/!3d(-?\d+\.\d+)/);
  const subLng = decodedContinue.match(/!4d(-?\d+\.\d+)/);
  if (subLat && subLng) {
    candidates.push({
      lat: subLat[1],
      lng: subLng[1],
      method: "login_continue_protobuf",
    });
  }
  const subAt = decodedContinue.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (subAt) {
    candidates.push({
      lat: subAt[1],
      lng: subAt[2],
      method: "login_continue_at",
    });
  }
}

// Extract all !3d/!4d/!2d
const allLats = html.match(/!3d(-?\d+\.\d+)/g) || [];
const allLngs = html.match(/(!4d|!2d)(-?\d+\.\d+)/g) || [];
for (let i = 0; i < Math.min(allLats.length, allLngs.length); i++) {
  candidates.push({
    lat: allLats[i].replace("!3d", ""),
    lng: allLngs[i].replace(/!4d|!2d/, ""),
    method: "protobuf_scan",
  });
}

const triplets = html.matchAll(/\[\d+,\s*(-?\d+\.\d+),\s*(-?\d+\.\d+)\]/g);
for (const match of triplets) {
  candidates.push({ lat: match[1], lng: match[2], method: "json_trip_A" });
  candidates.push({ lat: match[2], lng: match[1], method: "json_trip_B" });
}

console.log("\n=== CANDIDATES FOUND ===");
candidates.forEach((c, i) => {
  const isPP = Math.abs(parseFloat(c.lat) - 11.544) < 0.005;
  console.log(
    `[${i}] ${c.method}: ${c.lat}, ${c.lng} ${isPP ? "(BLACK-LISTED)" : "(VALID)"}`,
  );
});

const best =
  candidates.find((c) => {
    const lat = parseFloat(c.lat);
    const lng = parseFloat(c.lng);
    const inCambodia = lat > 9.5 && lat < 15 && lng > 102 && lng < 108;
    const isPP =
      Math.abs(lat - 11.544) < 0.005 && Math.abs(lng - 104.89) < 0.005;
    return inCambodia && !isPP;
  }) || candidates[0];

if (best) {
  console.log(
    "\n✅ BEST RESULT: " +
      best.lat +
      ", " +
      best.lng +
      " (" +
      best.method +
      ")",
  );
} else {
  console.log("\n❌ NO COORDS FOUND");
}
