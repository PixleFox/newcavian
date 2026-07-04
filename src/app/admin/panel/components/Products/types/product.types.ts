export type ProductStatus = 'draft' | 'active' | 'archived' | 'out_of_stock';
export type ProductType = 'physical' | 'digital' | 'service';

export interface ProductImage {
  id: string;
  url: string;
  file?: File; // For new uploads
  alt?: string;
  isMain: boolean;
  order: number;
  // For form handling
  isNew?: boolean;
  isDeleted?: boolean;
}

export interface ProductVariant {
  id: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  barcode?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  options: {
    name: string;
    value: string;
  }[];
  inventory: {
    quantity: number;
    trackInventory: boolean;
    allowBackorder: boolean;
  };
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  description?: string;
  image?: string;
  isActive: boolean;
  order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  sku: string;
  barcode?: string;
  type: ProductType;
  status: ProductStatus;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  requiresShipping: boolean;
  isDigitalProduct: boolean;
  hasVariants: boolean;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  taxClass?: string;
  taxRate?: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  images: ProductImage[];
  categories: string[];
  tags: string[];
  variants?: ProductVariant[];
  inventory: {
    quantity: number;
    trackInventory: boolean;
    allowBackorder: boolean;
    lowStockThreshold: number;
  };
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    canonicalUrl?: string;
  };
  relatedProducts: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
  publishedAt?: Date | string;
}

export type FormImage = string | File | ProductImage;

export interface ProductFormData extends Omit<Partial<Product>, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'images' | 'variants'> {
  id?: string;
  images: FormImage[];
  variants?: Omit<ProductVariant, 'id'>[];
}

export interface ProductFilterParams {
  search?: string;
  status?: ProductStatus | '';
  category?: string;
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ProductListResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}