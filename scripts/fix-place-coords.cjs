const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function parseCoordsFromLink(link) {
  if (!link) return null;

  try {
    const url = new URL(link);

    // Case: ?q=11.5564,104.9282
    const q = url.searchParams.get("q");
    if (q) {
      const m = q.match(
        /(-?\d{1,2}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)/,
      );
      if (m) {
        return { lat: Number(m[1]), lng: Number(m[2]) };
      }
    }

    // Case: .../@11.5564,104.9282,15z
    const at = link.match(/@(-?\d{1,2}(?:\.\d+)?),(-?\d{1,3}(?:\.\d+)?)/);
    if (at) {
      return { lat: Number(at[1]), lng: Number(at[2]) };
    }
  } catch {
    return null;
  }

  return null;
}

async function geocode(query) {
  const endpoint = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`;
  const res = await fetch(endpoint, {
    headers: {
      "User-Agent": "lomhea-coords-fix/1.0 (local-dev)",
      Accept: "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!Array.isArray(data) || !data[0]) return null;
  const lat = Number(data[0].lat);
  const lng = Number(data[0].lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

async function resolveCoords(place) {
  // 1) Use direct coordinates from saved map URL if present
  const parsed = parseCoordsFromLink(place.googleMapUrl);
  if (parsed) return parsed;

  // 2) Try geocoding by map URL query text
  const queries = [];
  if (place.googleMapUrl) {
    try {
      const u = new URL(place.googleMapUrl);
      const q = u.searchParams.get("q");
      if (q && q.trim()) queries.push(`${q}, Cambodia`);
    } catch {}
  }

  // 3) Fallback queries
  queries.push(`${place.name}, ${place.province}, Cambodia`);
  if (place.nameKh) queries.push(`${place.nameKh}, ${place.province}, Cambodia`);

  for (const q of queries) {
    const result = await geocode(q);
    await sleep(1100); // be respectful to public geocoding service
    if (result) return result;
  }

  return null;
}

async function main() {
  const places = await prisma.place.findMany({
    select: {
      id: true,
      name: true,
      nameKh: true,
      province: true,
      lat: true,
      lng: true,
      googleMapUrl: true,
    },
    orderBy: { createdAt: "asc" },
  });

  let updated = 0;
  let skipped = 0;

  for (const place of places) {
    const resolved = await resolveCoords(place);
    if (!resolved) {
      skipped += 1;
      console.log(`skip: ${place.name}`);
      continue;
    }

    await prisma.place.update({
      where: { id: place.id },
      data: {
        lat: Number(resolved.lat.toFixed(6)),
        lng: Number(resolved.lng.toFixed(6)),
      },
    });
    updated += 1;
    console.log(
      `updated: ${place.name} -> ${resolved.lat.toFixed(6)}, ${resolved.lng.toFixed(6)}`,
    );
  }

  console.log(`done: updated=${updated}, skipped=${skipped}, total=${places.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

