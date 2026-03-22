import { PrismaClient } from "@prisma/client";
import seedPlaces from "./places.seed.json";

const prisma = new PrismaClient();

type InputPlace = {
  place_name_en: string;
  place_name_kh?: string;
  province: string;
  category: string;
  google_maps_link?: string;
  description?: string;
  gallery?: string[];
};

const REQUIRED_PLACE_COUNT = 100;
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb";

function normalizeCategory(raw: string) {
  const value = (raw || "").toLowerCase();
  if (value.includes("temple") || value.includes("unesco")) return "Temple";
  if (value.includes("beach") || value.includes("island")) return "Beach";
  if (value.includes("waterfall")) return "Waterfall";
  if (
    value.includes("market") ||
    value.includes("food") ||
    value.includes("recreation")
  )
    return "Market";
  if (
    value.includes("cultural") ||
    value.includes("museum") ||
    value.includes("historical landmark")
  )
    return "Museum";
  return "Nature";
}

const imageValidationCache = new Map<string, boolean>();

function withUnsplashParams(url: string) {
  if (!url.includes("images.unsplash.com")) return url;
  const hasQuery = url.includes("?");
  const suffix = "auto=format&fit=crop&w=1400&q=80";
  return hasQuery ? `${url}&${suffix}` : `${url}?${suffix}`;
}

async function isImageReachable(url: string) {
  const cached = imageValidationCache.get(url);
  if (typeof cached === "boolean") return cached;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  try {
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      cache: "no-store",
    });
    const ok = res.ok;
    imageValidationCache.set(url, ok);
    return ok;
  } catch {
    imageValidationCache.set(url, false);
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

async function getValidImages(images?: string[]) {
  const candidates = (images || []).map((img) => withUnsplashParams(img.trim()));
  const valid: string[] = [];

  for (const url of candidates) {
    if (!url) continue;
    if (await isImageReachable(url)) valid.push(url);
  }

  if (!valid.length) return [FALLBACK_IMAGE];
  return valid;
}

const PROVINCE_CENTER: Record<string, { lat: number; lng: number }> = {
  "Siem Reap": { lat: 13.3633, lng: 103.8564 },
  "Preah Sihanouk": { lat: 10.625, lng: 103.523 },
  Mondulkiri: { lat: 12.455, lng: 107.18 },
  Kampot: { lat: 10.61, lng: 104.18 },
  Battambang: { lat: 13.0957, lng: 103.2022 },
  "Phnom Penh": { lat: 11.5564, lng: 104.9282 },
  Ratanakiri: { lat: 13.7394, lng: 106.9873 },
  "Kampong Speu": { lat: 11.459, lng: 104.524 },
  Kep: { lat: 10.4829, lng: 104.3167 },
  Kratie: { lat: 12.4881, lng: 106.0188 },
  "Koh Kong": { lat: 11.6153, lng: 102.9838 },
  "Kampong Thom": { lat: 12.7112, lng: 104.8885 },
  "Preah Vihear": { lat: 13.791, lng: 104.978 },
  "Kampong Cham": { lat: 11.9934, lng: 105.4635 },
  Pailin: { lat: 12.8489, lng: 102.6093 },
  Kandal: { lat: 11.2237, lng: 105.1259 },
  "Banteay Meanchey": { lat: 13.7532, lng: 102.9896 },
  "Oddar Meanchey": { lat: 14.1609, lng: 103.8216 },
  "Stung Treng": { lat: 13.5259, lng: 105.9683 },
  "Kampong Chhnang": { lat: 12.25, lng: 104.6667 },
  Takeo: { lat: 10.995, lng: 104.784 },
  "Tboung Khmum": { lat: 11.89, lng: 105.65 },
};

function hash(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function toCoordinates(name: string, province: string) {
  const center = PROVINCE_CENTER[province] ?? { lat: 12.5657, lng: 104.991 };
  const seed = hash(`${name}-${province}`);
  const latJitter = ((seed % 1000) / 1000 - 0.5) * 0.18;
  const lngJitter = ((((seed / 1000) | 0) % 1000) / 1000 - 0.5) * 0.18;
  return {
    lat: Number((center.lat + latJitter).toFixed(6)),
    lng: Number((center.lng + lngJitter).toFixed(6)),
  };
}

function sampleFeaturedIndexes(total: number, featuredCount: number) {
  const arr = Array.from({ length: total }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return new Set(arr.slice(0, Math.min(featuredCount, total)));
}

async function main() {
  console.log("Resetting place data...");

  if (seedPlaces.length < REQUIRED_PLACE_COUNT) {
    throw new Error(
      `Seed file has ${seedPlaces.length} places. Please provide at least ${REQUIRED_PLACE_COUNT} places.`,
    );
  }

  await prisma.favorite.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.accommodation.deleteMany({});
  await prisma.food.deleteMany({});
  await prisma.report.deleteMany({});
  await prisma.place.deleteMany({});

  const normalizedInput = (seedPlaces as InputPlace[]).slice(0, REQUIRED_PLACE_COUNT);
  const featuredIndexes = sampleFeaturedIndexes(normalizedInput.length, 10);
  const featuredUntil = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

  for (let i = 0; i < normalizedInput.length; i += 1) {
    const p = normalizedInput[i] as InputPlace;
    const coords = toCoordinates(p.place_name_en, p.province);
    const isFeatured = featuredIndexes.has(i);
    const images = await getValidImages(p.gallery);

    await prisma.place.create({
      data: {
        name: p.place_name_en,
        nameKh: p.place_name_kh || null,
        province: p.province,
        category: normalizeCategory(p.category),
        description: p.description || null,
        googleMapUrl: p.google_maps_link || null,
        images,
        lat: coords.lat,
        lng: coords.lng,
        isVerified: true,
        isFeatured,
        featuredUntil: isFeatured ? featuredUntil : null,
      },
    });
  }

  console.log(`Imported ${normalizedInput.length} places.`);
  console.log(`Featured places: ${featuredIndexes.size}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
