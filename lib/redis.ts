import { Redis } from "@upstash/redis";

if (
  !process.env.UPSTASH_REDIS_REST_URL ||
  !process.env.UPSTASH_REDIS_REST_TOKEN
) {
  throw new Error("Missing Upstash Redis environment variables");
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// For compatibility with libraries that expect ioredis (if needed later)
// export const ioredis = new (require("ioredis"))(process.env.REDIS_URL);
