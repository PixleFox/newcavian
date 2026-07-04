// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';
import { generateProductCode } from '@/lib/generateProductCode';
import { Prisma } from '@prisma/client';

// Define interfaces for input data
interface FormFields {
  name: string;
  description: string;
  material: string;
  gender: string;
  type: string;
  sleeve_type: string;
  collar_type: string;
  discount_percent?: string;
  category_ids?: string;
  variants: string;
  mainImageIndex?: string;
}

interface ProductVariantInput {
  size: string;
  color: string;
  stock: number;
  price: number;
}

interface ProductImage {
  image_url: string;
  is_main_image: boolean;
}

type VariantWithOrderItems = Prisma.ProductVariantGetPayload<{
  include: { orderItems: true };
}>;

// New upload directory (outside public)
const uploadDir = path.join(process.cwd(), 'uploads', 'images');

async function ensureUploadDir() {
  try {
    await fs.mkdir(uploadDir, { recursive: true });
  } catch (error) {
    console.error('❌ Failed to create upload directory:', error);
    throw new Error('Failed to initialize upload directory');
  }
}

async function parseFormData(request: Request): Promise<{ fields: FormFields; images: ProductImage[] }> {
  const formData = await request.formData();
  const fields: Partial<FormFields> = {};
  const files: File[] = [];

  for (const [key, value] of formData.entries()) {
    if (value instanceof File && value.size > 0) {
      files.push(value);
    } else {
      fields[key as keyof FormFields] = value.toString();
    }
  }

  if (!fields.name || !fields.description || !fields.material || !fields.gender || !fields.type ||
      !fields.sleeve_type || !fields.collar_type || !fields.variants) {
    throw new Error('Missing required fields');
  }

  await ensureUploadDir();

  const mainImageIndex = fields.mainImageIndex ? parseInt(fields.mainImageIndex, 10) : 0;

  const images = await Promise.all(
    files.map(async (file, index) => {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      if (!['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
        throw new Error('Invalid image format');
      }
      const fileName = `${Date.now()}-${index}-${file.name.replace(/\s+/g, '_').replace(/\.[^/.]+$/, '')}.${ext}`;
      const filePath = path.join(uploadDir, fileName);
      const arrayBuffer = await file.arrayBuffer();
      try {
        await fs.writeFile(filePath, Buffer.from(arrayBuffer));
        await fs.access(filePath);
        console.log(`✅ Saved image: ${filePath} (type: ${file.type})`);
      } catch (writeError) {
        console.error(`❌ Failed to save image ${fileName}:`, writeError);
        throw new Error(`Failed to save image: ${fileName}`);
      }
      // Store relative path for API route
      return {
        image_url: `/api/images/${fileName}`,
        is_main_image: index === mainImageIndex,
      };
    })
  );

  return { fields: fields as FormFields, images };
}

// POST: Create a new product
export async function POST(request: Request) {
  try {
    const { fields, images } = await parseFormData(request);

    const errors: Record<string, string> = {};
    if (!['نخ پنبه', 'اسپان', 'ترکیبی', 'فلامنت', 'جودون', 'ویسکوز', 'ملانژ'].includes(fields.material)) {
      errors.material = 'جنس محصول باید یکی از مقادیر معتبر باشد';
    }
    if (!['MALE', 'FEMALE', 'UNISEX'].includes(fields.gender)) {
      errors.gender = 'جنسیت باید یکی از مقادیر MALE، FEMALE یا UNISEX باشد';
    }
    if (!['T_SHIRT', 'ACCESSORIES'].includes(fields.type)) {
      errors.type = 'نوع محصول باید T_SHIRT یا ACCESSORIES باشد';
    }
    if (!['SHORT', 'LONG', 'SLEEVELESS'].includes(fields.sleeve_type)) {
      errors.sleeve_type = 'نوع آستین باید SHORT، LONG یا SLEEVELESS باشد';
    }
    if (!['CIRCLE', 'SEVEN', 'COLLARED'].includes(fields.collar_type)) {
      errors.collar_type = 'نوع یقه باید CIRCLE، SEVEN یا COLLARED باشد';
    }

    const variants: ProductVariantInput[] = JSON.parse(fields.variants);
    if (variants.length === 0) errors.variants = 'حداقل یک متغیر الزامی است';

    for (const variant of variants) {
      const stock = Number(variant.stock);
      const price = Number(variant.price);
      if (isNaN(stock) || stock < 0 || stock > 99999999) {
        errors[`variant_stock_${variant.size}_${variant.color}`] = `موجودی باید بین 0 و 99,999,999 باشد`;
      }
      if (isNaN(price) || price < 0 || price > 99999999.99) {
        errors[`variant_price_${variant.size}_${variant.color}`] = `قیمت باید بین 0 و 99,999,999.99 باشد`;
      }
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: 'خطا در داده‌های ورودی', details: errors }, { status: 400 });
    }

    let productCode = '';
    let isCodeUnique = false;
    while (!isCodeUnique) {
      productCode = generateProductCode();
      const existingProduct = await prisma.product.findUnique({
        where: { product_code: productCode },
      });
      if (!existingProduct) isCodeUnique = true;
    }

    const categoryId = fields.category_ids ? Number(fields.category_ids) : undefined;
    const product = await prisma.product.create({
      data: {
        name: fields.name,
        description: fields.description,
        material: fields.material,
        gender: fields.gender as 'MALE' | 'FEMALE' | 'UNISEX',
        type: fields.type as 'T_SHIRT' | 'ACCESSORIES',
        sleeve_type: fields.sleeve_type as 'SHORT' | 'LONG' | 'SLEEVELESS',
        collar_type: fields.collar_type as 'CIRCLE' | 'SEVEN' | 'COLLARED',
        product_code: productCode,
        discount_percent: fields.discount_percent ? parseFloat(fields.discount_percent) : 0,
        ...(categoryId && !isNaN(categoryId) ? { categories: { connect: { id: categoryId } } } : {}),
      },
    });

    if (variants.length > 0) {
      await prisma.productVariant.createMany({
        data: variants.map(variant => ({
          productId: product.id,
          size: variant.size,
          color: variant.color,
          stock: Number(variant.stock),
          price: Number(variant.price),
          sku: `${productCode}${variant.size}${variant.color.replace(/\s+/g, '')}`,
        })),
      });
    }

    if (images.length > 0) {
      await prisma.productImage.createMany({
        data: images.map(image => ({
          productId: product.id,
          image_url: image.image_url,
          is_main_image: image.is_main_image,
        })),
      });
    }

    return NextResponse.json({ success: true, productId: product.id }, { status: 201 });
  } catch (error) {
    console.error('❌ خطا در ایجاد محصول:', error);
    return NextResponse.json(
      {
        error: 'خطا در ایجاد محصول',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET: Fetch products
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const product = await prisma.product.findUnique({
        where: { id: Number(id) },
        include: { variants: true, category: true },
      });
      return product
        ? NextResponse.json({ success: true, data: product })
        : NextResponse.json({ error: 'محصول یافت نشد' }, { status: 404 });
    }

    const limit = Number(searchParams.get('limit') || 100);
    const isNewParam = searchParams.get('isNew');
    const where: Record<string, unknown> = {};
    if (isNewParam === 'true') where.isNew = true;

    const products = await prisma.product.findMany({
      take: limit,
      where,
      include: { variants: true, category: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: { products } });
  } catch (error) {
    console.error('❌ خطا در دریافت محصولات:', error);
    return NextResponse.json(
      {
        error: 'خطا در دریافت محصولات',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT: Update product
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'شناسه محصول الزامی است' }, { status: 400 });

    const { fields, images } = await parseFormData(request);
    const productId = Number(id);

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true, images: true, categories: true },
    });
    if (!existingProduct) {
      return NextResponse.json({ error: 'محصول با این شناسه یافت نشد' }, { status: 404 });
    }

    const errors: Record<string, string> = {};
    if (!['نخ پنبه', 'اسپان', 'ترکیبی', 'فلامنت', 'جودون', 'ویسکوز', 'ملانژ'].includes(fields.material)) {
      errors.material = 'جنس محصول باید یکی از مقادیر معتبر باشد';
    }
    if (!['MALE', 'FEMALE', 'UNISEX'].includes(fields.gender)) {
      errors.gender = 'جنسیت باید یکی از مقادیر MALE، FEMALE یا UNISEX باشد';
    }
    if (!['T_SHIRT', 'ACCESSORIES'].includes(fields.type)) {
      errors.type = 'نوع محصول باید T_SHIRT یا ACCESSORIES باشد';
    }
    if (!['SHORT', 'LONG', 'SLEEVELESS'].includes(fields.sleeve_type)) {
      errors.sleeve_type = 'نوع آستین باید SHORT، LONG یا SLEEVELESS باشد';
    }
    if (!['CIRCLE', 'SEVEN', 'COLLARED'].includes(fields.collar_type)) {
      errors.collar_type = 'نوع یقه باید CIRCLE، SEVEN یا COLLARED باشد';
    }

    const variants: ProductVariantInput[] = JSON.parse(fields.variants);
    if (variants.length === 0) errors.variants = 'حداقل یک متغیر الزامی است';

    for (const variant of variants) {
      const stock = Number(variant.stock);
      const price = Number(variant.price);
      if (isNaN(stock) || stock < 0 || stock > 99999999) {
        errors[`variant_stock_${variant.size}_${variant.color}`] = `موجودی باید بین 0 و 99,999,999 باشد`;
      }
      if (isNaN(price) || price < 0 || price > 99999999.99) {
        errors[`variant_price_${variant.size}_${variant.color}`] = `قیمت باید بین 0 و 99,999,999.99 باشد`;
      }
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: 'خطا در داده‌های ورودی', details: errors }, { status: 400 });
    }

    const categoryId = fields.category_ids ? Number(fields.category_ids) : undefined;
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name: fields.name,
        description: fields.description,
        material: fields.material,
        gender: fields.gender as 'MALE' | 'FEMALE' | 'UNISEX',
        type: fields.type as 'T_SHIRT' | 'ACCESSORIES',
        sleeve_type: fields.sleeve_type as 'SHORT' | 'LONG' | 'SLEEVELESS',
        collar_type: fields.collar_type as 'CIRCLE' | 'SEVEN' | 'COLLARED',
        discount_percent: fields.discount_percent ? parseFloat(fields.discount_percent) : 0,
        ...(categoryId && !isNaN(categoryId) ? { categories: { set: [], connect: { id: categoryId } } } : {}),
      },
    });

    const existingVariants = await prisma.productVariant.findMany({
      where: { productId },
      include: { orderItems: true },
    });

    const variantsToDelete = existingVariants
      .filter((variant: VariantWithOrderItems) => variant.orderItems.length === 0)
      .map((variant: VariantWithOrderItems) => variant.id);

    if (variantsToDelete.length > 0) {
      await prisma.productVariant.deleteMany({
        where: { id: { in: variantsToDelete } },
      });
    }

    if (variants.length > 0) {
      const variantData = variants.map((variant: ProductVariantInput) => ({
        productId,
        size: variant.size,
        color: variant.color,
        stock: Number(variant.stock),
        price: Number(variant.price),
        sku: `${existingProduct.product_code}${variant.size}${variant.color.replace(/\s+/g, '')}`,
      }));

      const preservedVariants = existingVariants.filter((v: VariantWithOrderItems) => v.orderItems.length > 0);
      for (const variant of variantData) {
        const existing = preservedVariants.find(
          (v: VariantWithOrderItems) => v.size === variant.size && v.color === variant.color
        );
        if (existing) {
          await prisma.productVariant.update({
            where: { id: existing.id },
            data: { stock: variant.stock, price: variant.price },
          });
        } else {
          await prisma.productVariant.create({ data: variant });
        }
      }
    }

    if (images.length > 0) {
      const existingImages = await prisma.productImage.findMany({ where: { productId } });
      await Promise.all(
        existingImages.map(async (img: ProductImage) => {
          const filePath = path.join(uploadDir, path.basename(img.image_url));
          try {
            await fs.unlink(filePath);
            console.log(`✅ Deleted image: ${filePath}`);
          } catch (err: unknown) {
            if (err instanceof Error && 'code' in err && err.code === 'ENOENT') {
              console.warn(`Image not found, skipping: ${filePath}`);
            } else {
              console.error(`❌ Failed to delete image ${img.image_url}:`, err);
            }
          }
        })
      );
      await prisma.productImage.deleteMany({ where: { productId } });
      await prisma.productImage.createMany({
        data: images.map((image: ProductImage) => ({
          productId,
          image_url: image.image_url,
          is_main_image: image.is_main_image,
        })),
      });
    }

    return NextResponse.json({ success: true, productId: updatedProduct.id }, { status: 200 });
  } catch (error) {
    console.error('❌ خطا در به‌روزرسانی محصول:', error);
    return NextResponse.json(
      {
        error: 'خطا در به‌روزرسانی محصول',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE: Remove product
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'شناسه محصول الزامی است' }, { status: 400 });

    const productId = Number(id);
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return NextResponse.json({ error: 'محصول با این شناسه یافت نشد' }, { status: 404 });

    const variants = await prisma.productVariant.findMany({
      where: { productId },
      include: { orderItems: true },
    });
    if (variants.some((v: VariantWithOrderItems) => v.orderItems.length > 0)) {
      return NextResponse.json(
        { error: 'نمی‌توان محصول را حذف کرد زیرا به سفارشات مرتبط است' },
        { status: 400 }
      );
    }

    await prisma.productVariant.deleteMany({ where: { productId } });

    const images = await prisma.productImage.findMany({ where: { productId } });
    await Promise.all(
      images.map(async (img: ProductImage) => {
        const filePath = path.join(uploadDir, path.basename(img.image_url));
        try {
          await fs.unlink(filePath);
          console.log(`✅ Deleted image: ${filePath}`);
        } catch (err: unknown) {
          if (err instanceof Error && 'code' in err && err.code === 'ENOENT') {
            console.warn(`Image not found, skipping: ${filePath}`);
          } else {
            console.error(`❌ Failed to delete image ${img.image_url}:`, err);
          }
        }
      })
    );
    await prisma.productImage.deleteMany({ where: { productId } });

    await prisma.product.delete({ where: { id: productId } });

    return NextResponse.json(
      { success: true, message: 'محصول با موفقیت حذف شد' },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ خطا در حذف محصول:', error);
    return NextResponse.json(
      {
        error: 'خطا در حذف محصول',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}