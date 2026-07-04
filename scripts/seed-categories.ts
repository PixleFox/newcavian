import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: 'موسیقی',       slug: 'music',       description: 'طرح‌های موسیقی و هنرمندان',         order: 1 },
  { name: 'فیلم و سریال', slug: 'film',        description: 'طرح‌های سینما و سریال',             order: 2 },
  { name: 'بازی',         slug: 'game',        description: 'طرح‌های بازی‌های ویدیویی',          order: 3 },
  { name: 'انیمه',        slug: 'anime',       description: 'طرح‌های انیمه و مانگا',             order: 4 },
  { name: 'نوستالژی',     slug: 'nostalgia',   description: 'طرح‌های خاطره‌انگیز کلاسیک',       order: 5 },
  { name: 'میم و فان',    slug: 'meme',        description: 'طرح‌های طنز و میم',                 order: 6 },
  { name: 'کامیک',        slug: 'comic',       description: 'طرح‌های کمیک و ابرقهرمانان',       order: 7 },
  { name: 'تاریخ و هنر',  slug: 'art-history', description: 'طرح‌های تاریخی و هنری',            order: 8 },
  { name: 'سایر',         slug: 'other',       description: 'سایر طرح‌ها',                       order: 9 },
];

async function main() {
  console.log('🌱 Seeding categories...');

  for (const cat of CATEGORIES) {
    const existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
    if (existing) {
      console.log(`  ⏭  Already exists: ${cat.name}`);
      continue;
    }
    await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        order: cat.order,
        isActive: true,
        featured: false,
      },
    });
    console.log(`  ✅ Created: ${cat.name}`);
  }

  // Assign products that don't have a valid category to "سایر"
  const otherCat = await prisma.category.findUnique({ where: { slug: 'other' } });
  if (otherCat) {
    const validCatIds = (await prisma.category.findMany({ select: { id: true } })).map(c => c.id);
    const orphanedProducts = await prisma.product.findMany({
      where: { categoryId: { notIn: validCatIds } },
      select: { id: true, name: true },
    });
    if (orphanedProducts.length > 0) {
      console.log(`\n🔧 Reassigning ${orphanedProducts.length} products to "سایر"...`);
      for (const p of orphanedProducts) {
        await prisma.product.update({
          where: { id: p.id },
          data: { categoryId: otherCat.id },
        });
        console.log(`  ↪  ${p.name}`);
      }
    }
  }

  console.log('\n✅ Done!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
