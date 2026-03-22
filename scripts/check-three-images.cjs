const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async()=>{
  const names = ['Central Market','Bamboo Train','Kep Crab Market'];
  const rows = await prisma.place.findMany({
    where: { name: { in: names } },
    select: { name: true, images: true, province: true }
  });
  console.log(JSON.stringify(rows,null,2));
  await prisma.$disconnect();
})();
