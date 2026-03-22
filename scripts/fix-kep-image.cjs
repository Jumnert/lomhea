const { PrismaClient } = require('@prisma/client');
const { Redis } = require('@upstash/redis');

const prisma = new PrismaClient();
const redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN });

async function invalidatePattern(pattern) {
  let cursor = '0';
  do {
    const [nextCursor, keys] = await redis.scan(cursor, { match: pattern });
    if (keys.length) await redis.del(...keys);
    cursor = nextCursor;
  } while (cursor !== '0');
}

(async()=>{
  await prisma.place.updateMany({
    where: { name: 'Kep Crab Market' },
    data: {
      images: ['https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1400&q=80']
    }
  });
  await invalidatePattern('places:*');
  console.log('Kep Crab Market image updated + cache cleared');
  await prisma.$disconnect();
})();
