export type ProductType = 'T_SHIRT' | 'MUG' | 'ACCESSORY' | 'OTHER';

export const PRODUCT_TYPE_VALUES: readonly ProductType[] = ['T_SHIRT', 'MUG', 'ACCESSORY', 'OTHER'];

export type ProductStatus = 'draft' | 'active' | 'archived';

export interface ProductVariant {
  id: string;
  color: string;
  size: string;
  stock: number;
  price?: number;
  sku?: string;
  barcode?: string;
  image?: string;
  isActive?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface Product {
  id: string;
  sku: string;
  barcode?: string;
  name: string;
  description: string;
  type: ProductType;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  mainImage?: string;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  totalStock: number;
  variants: ProductVariant[];
  status: ProductStatus;
  category: string;
  tags?: string[];
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  metaTitle?: string;
  metaDescription?: string;
  seoUrl?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ProductFormData {
  id?: string;
  name: string;
  description: string;
  sku: string;
  barcode?: string;
  type: ProductType;
  price: number | string;
  compareAtPrice?: number | string;
  costPrice?: number | string;
  mainImage?: File | string;
  images?: (File | string)[];
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  status: ProductStatus;
  category: string;
  tags?: string[];
  weight?: number | string;
  dimensions?: {
    length: number | string;
    width: number | string;
    height: number | string;
  };
  variants?: Array<{
    id?: string;
    color: string;
    size: string;
    stock: number | string;
    price?: number | string;
    sku?: string;
    barcode?: string;
    image?: File | string;
    isActive?: boolean;
  }>;
  metaTitle?: string;
  metaDescription?: string;
  seoUrl?: string;
}

export interface ProductListResponse {
  success: boolean;
  data: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProductResponse {
  success: boolean;
  data: Product;
}

export interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  outOfStock: number;
  categories: Array<{
    name: string;
    count: number;
  }>;
}

export interface ProductStatsResponse {
  success: boolean;
  data: ProductStats;
}
