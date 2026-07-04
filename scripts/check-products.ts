import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const cats = await prisma.category.findMany({ select: { id: true, name: true, slug: true } });
  console.log('=== Categories ===');
  cats.forEach(c => console.log(c.id, c.name));

  const prods = await prisma.product.findMany({ select: { id: true, name: true, categoryId: true, tags: true, isActive: true } });
  console.log('\n=== Products ===');
  prods.forEach(p => console.log(p.name, '|', p.categoryId, '|', p.tags, '| active:', p.isActive));
}
main().catch(console.error).finally(() => prisma.$disconnect());
