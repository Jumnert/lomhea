import { redis } from "./redis";

/**
 * Get data from cache or fetch it and store it if not present.
 */
export async function getOrSetCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 3600,
): Promise<T> {
  const cached = await redis.get<T>(key);
  if (cached !== null) {
    console.log(`[Cache Hit] ${key}`);
    return cached;
  }

  console.log(`[Cache Miss] ${key}`);
  const data = await fetcher();
  await redis.set(key, data, { ex: ttlSeconds });
  return data;
}

/**
 * Invalidate a specific cache key.
 */
export async function invalidateCache(key: string) {
  await redis.del(key);
}

/**
 * Invalidate keys matching a pattern.
 * Note: Use sparingly on large datasets as it uses SCAN.
 */
export async function invalidatePattern(pattern: string) {
  let cursor = "0";
  do {
    const [nextCursor, keys] = await redis.scan(cursor, { match: pattern });
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    cursor = nextCursor;
  } while (cursor !== "0");
}

/**
 * Lightweight metrics: Increment a counter.
 */
export async function trackMetric(name: string, value: number = 1) {
  const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const key = `metrics:${name}:${date}`;
  await redis.incrby(key, value);
  await redis.expire(key, 60 * 60 * 24 * 7); // Keep for 7 days
}
