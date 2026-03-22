const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const USER_AGENT =
  "Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=80";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function isCambodia(lat, lng) {
  return lat > 9.5 && lat < 15 && lng > 102 && lng < 108;
}

async function resolveCoords(url) {
  if (!url) return null;

  let currentUrl = url;
  let finalHtml = "";
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent": USER_AGENT,
        "Accept-Language": "en-US,en;q=0.9",
        Referer: "https://www.google.com/",
      },
      cache: "no-store",
    });
    currentUrl = res.url;
    finalHtml = await res.text();
  } catch {
    return null;
  }

  const candidates = [];
  const urlMatches = [
    currentUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/),
    currentUrl.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/),
  ];
  for (const m of urlMatches) {
    if (m) candidates.push({ lat: Number(m[1]), lng: Number(m[2]) });
  }

  try {
    const searchParams = new URL(currentUrl).searchParams;
    const q = searchParams.get("q") || searchParams.get("query");
    if (q) {
      const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(q)}&output=embed&hl=en`;
      const embedRes = await fetch(embedUrl, {
        headers: { "User-Agent": USER_AGENT },
        cache: "no-store",
      });
      const embedHtml = await embedRes.text();
      const initMatch = embedHtml.match(
        /\["0x[0-9a-f]+:[0-9a-f]+",\s*"[^"]*",\s*\[(-?\d+\.\d+),\s*(-?\d+\.\d+)\]/,
      );
      if (initMatch) {
        candidates.push({ lat: Number(initMatch[1]), lng: Number(initMatch[2]) });
      }
    }
  } catch {}

  const htmlMatches = [...finalHtml.matchAll(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/g)];
  for (const m of htmlMatches) {
    candidates.push({ lat: Number(m[1]), lng: Number(m[2]) });
  }

  return candidates.find((c) => isCambodia(c.lat, c.lng)) || null;
}

async function geocodeQuery(query) {
  if (!query) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "lomhea/1.0" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || !data[0]) return null;
    const lat = Number(data[0].lat);
    const lng = Number(data[0].lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    if (!isCambodia(lat, lng)) return null;
    return { lat, lng };
  } catch {
    return null;
  }
}

async function isImageUrlOk(url) {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow", cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}

async function fetchWikipediaImages(name, province) {
  const out = [];

  // Summary thumbnail
  try {
    const summaryRes = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`,
      { headers: { "User-Agent": "lomhea/1.0" }, cache: "no-store" },
    );
    if (summaryRes.ok) {
      const summary = await summaryRes.json();
      if (summary?.thumbnail?.source) out.push(summary.thumbnail.source);
      if (summary?.originalimage?.source) out.push(summary.originalimage.source);
    }
  } catch {}

  // Wikimedia commons search
  try {
    const q = `${name} ${province} Cambodia`;
    const wmUrl =
      `https://commons.wikimedia.org/w/api.php?action=query&generator=search` +
      `&gsrsearch=${encodeURIComponent(q)}` +
      `&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url&format=json`;
    const wmRes = await fetch(wmUrl, {
      headers: { "User-Agent": "lomhea/1.0" },
      cache: "no-store",
    });
    if (wmRes.ok) {
      const wmData = await wmRes.json();
      const pages = Object.values(wmData?.query?.pages || {});
      for (const page of pages) {
        const ii = page?.imageinfo?.[0]?.url;
        if (ii) out.push(ii);
      }
    }
  } catch {}

  const unique = [...new Set(out)].filter(Boolean);
  const valid = [];
  for (const img of unique) {
    if (await isImageUrlOk(img)) valid.push(img);
    if (valid.length >= 3) break;
  }

  return valid;
}

async function main() {
  const places = await prisma.place.findMany({
    select: {
      id: true,
      name: true,
      province: true,
      googleMapUrl: true,
      images: true,
    },
  });

  let coordsUpdated = 0;
  let imagesUpdated = 0;

  for (const place of places) {
    const data = {};

    let coords = await resolveCoords(place.googleMapUrl);
    if (!coords && place.googleMapUrl) {
      try {
        const u = new URL(place.googleMapUrl);
        const q = u.searchParams.get("q") || "";
        coords = await geocodeQuery(`${q}, Cambodia`);
      } catch {}
    }
    if (!coords) {
      coords = await geocodeQuery(`${place.name}, ${place.province}, Cambodia`);
    }
    if (coords) {
      data.lat = Number(coords.lat.toFixed(6));
      data.lng = Number(coords.lng.toFixed(6));
      coordsUpdated += 1;
    }

    const newImages = await fetchWikipediaImages(place.name, place.province);
    if (newImages.length) {
      data.images = newImages;
      imagesUpdated += 1;
    } else {
      const existing = (place.images || []).filter(Boolean);
      data.images = existing.length ? existing : [FALLBACK_IMAGE];
    }

    await prisma.place.update({ where: { id: place.id }, data });
    console.log(`updated: ${place.name}`);
    await sleep(900);
  }

  console.log(`done: places=${places.length}, coordsUpdated=${coordsUpdated}, imagesUpdated=${imagesUpdated}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
