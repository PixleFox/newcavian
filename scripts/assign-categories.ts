import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// keyword → category slug mapping (order matters — first match wins)
const RULES: { keywords: string[]; slug: string }[] = [
  {
    slug: 'music',
    keywords: ['پینک فلوید', 'فلوید', 'دارک ساید', 'متالیکا', 'نیروانا', 'موسیق', 'راک', 'پاپ', 'رپ', 'هوی متال',
                'بیتلز', 'رادیو هد', 'لد زپلین', 'دیوید بویی', 'کوئین', 'دیو'],
  },
  {
    slug: 'film',
    keywords: ['فیلم', 'سریال', 'سینما', 'ذهن زیبا', 'برکینگ بد', 'گیم اف ترونز', 'ماتریکس', 'گاد فادر',
                'اینتراستلار', 'نولان', 'مارول', 'دی سی'],
  },
  {
    slug: 'game',
    keywords: ['erdtree', 'الدن رینگ', 'elden', 'بازی', 'گیم', 'ریسک', 'ماینکرافت', 'فورتنایت', 'والوران',
                'پابجی', 'جی تی ای', 'سایبرپانک', 'سایبر گای'],
  },
  {
    slug: 'anime',
    keywords: ['انیمه', 'مانگا', 'ناروتو', 'درگون بال', 'دمون اسلیر', 'اتک آن تایتان', 'جوجوتسو',
                'وان پیس', 'بلیچ', 'سواد کردن'],
  },
  {
    slug: 'nostalgia',
    keywords: ['نوستالژ', 'قدیمی', 'کلاسیک', 'خاطره', 'رترو', 'retro', 'vintage'],
  },
  {
    slug: 'meme',
    keywords: ['میم', 'فان', 'طنز', 'خنده', 'جوک', 'کمدی', 'پیچاپیچ', 'فکرهای خوب', 'گشت و گذار'],
  },
  {
    slug: 'comic',
    keywords: ['کمیک', 'کامیک', 'ابرقهرمان', 'سوپرمن', 'بتمن', 'اسپایدرمن', 'مارول', 'ایرون من'],
  },
  {
    slug: 'art-history',
    keywords: ['کوروش', 'داریوش', 'تخت جمشید', 'هخامنش', 'ایران باستان', 'تاریخ', 'هنر', 'نقاشی',
                'چشم مزدا', 'کوهستان سرخ', 'تخت داریوش'],
  },
];

function detectSlug(name: string): string {
  const lower = name.toLowerCase();
  for (const rule of RULES) {
    if (rule.keywords.some(kw => lower.includes(kw.toLowerCase()))) {
      return rule.slug;
    }
  }
  return 'other';
}

async function main() {
  const categories = await prisma.category.findMany({ select: { id: true, slug: true, name: true } });
  const catMap = Object.fromEntries(categories.map(c => [c.slug, c.id]));

  const products = await prisma.product.findMany({ select: { id: true, name: true, categoryId: true } });

  console.log(`📦 ${products.length} محصول پیدا شد\n`);

  for (const prod of products) {
    const slug = detectSlug(prod.name);
    const newCatId = catMap[slug];
    if (!newCatId) { console.log(`⚠️  slug "${slug}" در DB نیست`); continue; }

    await prisma.product.update({ where: { id: prod.id }, data: { categoryId: newCatId } });
    const catName = categories.find(c => c.slug === slug)?.name ?? slug;
    console.log(`  ✅ ${prod.name}  →  ${catName}`);
  }

  console.log('\n✅ تمام!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
