const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const total = await prisma.place.count();
  const featured = await prisma.place.count({ where: { isFeatured: true } });
  const sample = await prisma.place.findMany({
    take: 3,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      nameKh: true,
      category: true,
      province: true,
      lat: true,
      lng: true,
      isVerified: true,
      isFeatured: true,
      googleMapUrl: true,
      images: true,
      featuredUntil: true,
    },
  });

  console.log(JSON.stringify({ total, featured, sample }, null, 2));
  await prisma.$disconnect();
})();
