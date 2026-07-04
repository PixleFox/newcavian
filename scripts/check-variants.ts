import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const prods = await prisma.product.findMany({
    take: 3,
    include: { variants: true, clothingAttributes: true, category: true },
  });
  console.log(JSON.stringify(prods, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
