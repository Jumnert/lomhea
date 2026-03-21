const fetch = require("node-fetch");

async function test(url) {
  let currentUrl = url;
  let iterations = 0;
  const userAgent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

  console.log(`\n--- TESTING: ${url} ---`);
  while (iterations < 10) {
    try {
      const res = await fetch(currentUrl, {
        method: "HEAD",
        redirect: "manual",
        headers: { "User-Agent": userAgent },
      });
      const location = res.headers.get("location");
      if (!location) break;
      currentUrl = location.startsWith("/")
        ? new URL(location, currentUrl).href
        : location;
      console.log(`[${iterations + 1}] -> ${currentUrl}`);
    } catch (e) {
      break;
    }
    iterations++;
  }

  const extractCoords = (str) => {
    // 1. Check for !3d/!4d (Actual pin - HIGH PRECISION)
    const latM = str.match(/!3d(-?\d+\.\d+)/);
    const lngM = str.match(/!4d(-?\d+\.\d+)/);
    if (latM && lngM) {
      return { lat: latM[1], lng: lngM[1], type: "PIN (!3d/!4d)" };
    }

    // 2. Check for @ (Viewport center - OFFSET BY KM)
    const atM = str.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atM) {
      return { lat: atM[1], lng: atM[2], type: "VIEWPORT (@lat,lng)" };
    }

    // 3. Query params
    const qM = str.match(/[?&](?:query|q|ll)=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (qM) {
      return { lat: qM[1], lng: qM[2], type: "QUERY (?q=)" };
    }

    return null;
  };

  const result = extractCoords(currentUrl);
  if (result) {
    console.log(`✅ MATCH FOUND (${result.type})`);
    console.log(`   LAT: ${result.lat}`);
    console.log(`   LNG: ${result.lng}`);
    if (result.type.includes("VIEWPORT")) {
      console.log(
        `   ⚠️ WARNING: This coordinate is from the viewport center and may be off by 4-8km.`,
      );
    }
  } else {
    console.log("❌ NO COORDINATES FOUND IN URL");
  }
}

// Test common patterns
(async () => {
  // Angkor Wat - !3d is 13.41246, but @ center might be different
  await test("https://maps.app.goo.gl/BmHQzuh7pPGkRRgS9");
})();
