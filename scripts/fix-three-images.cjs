const { PrismaClient } = require('@prisma/client');
const { Redis } = require('@upstash/redis');

const prisma = new PrismaClient();

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

async function invalidatePattern(pattern) {
  let cursor = '0';
  do {
    const [nextCursor, keys] = await redis.scan(cursor, { match: pattern });
    if (keys.length) await redis.del(...keys);
    cursor = nextCursor;
  } while (cursor !== '0');
}

async function main() {
  const updates = [
    {
      name: 'Central Market',
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/4/41/20171125_Central_Market%2C_Phnom_Penh_4368_DxO.jpg',
      ],
    },
    {
      name: 'Bamboo Train',
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/6/66/Battambang_Norry_2016_3.jpg',
      ],
    },
    {
      name: 'Kep Crab Market',
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/c/c2/06-Kep_Crab_Market_Cambodia-nX-7.jpg',
      ],
    },
  ];

  for (const u of updates) {
    await prisma.place.updateMany({
      where: { name: u.name },
      data: { images: u.images },
    });
    console.log(`updated image: ${u.name}`);
  }

  await invalidatePattern('places:*');
  console.log('cache invalidated: places:*');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
