import { Product, ProductStatus, ProductType } from '../types';

/**
 * Formats a price with currency and RTL support for Persian numbers
 */
export const formatPrice = (price: number, currency: string = 'IRR'): string => {
  return new Intl.NumberFormat('fa-IR', {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
  }).format(price);
};

/**
 * Gets the status color and label for a product status
 */
export const getStatusInfo = (status: ProductStatus) => {
  const statusMap = {
    draft: { color: 'bg-yellow-100 text-yellow-800', label: 'پیش‌نویس' },
    active: { color: 'bg-green-100 text-green-800', label: 'فعال' },
    archived: { color: 'bg-gray-100 text-gray-800', label: 'بایگانی' },
    out_of_stock: { color: 'bg-red-100 text-red-800', label: 'نا موجود' },
  };
  return statusMap[status] || { color: 'bg-gray-100 text-gray-800', label: status };
};

/**
 * Gets the product type label
 */
export const getProductTypeLabel = (type: ProductType): string => {
  const typeMap = {
    physical: 'فیزیکی',
    digital: 'دیجیتال',
    service: 'خدمات',
  };
  return typeMap[type] || type;
};

/**
 * Generates a URL-friendly slug from a string
 */
export const generateSlug = (str: string): string => {
  return str
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
};

/**
 * Validates if a product has all required fields
 */
export const validateProduct = (product: Partial<Product>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!product.name?.trim()) errors.push('نام محصول الزامی است');
  if (!product.sku?.trim()) errors.push('کد محصول الزامی است');
  if (product.price == null || product.price < 0) errors.push('قیمت معتبر وارد کنید');
  if (product.type === 'physical' && product.weight != null && product.weight < 0) {
    errors.push('وزن نمی‌تواند منفی باشد');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Creates a new product with default values
 */
export const createNewProduct = (): Product => ({
  id: '',
  name: '',
  slug: '',
  description: '',
  shortDescription: '',
  sku: `SKU-${Date.now()}`,
  type: 'physical',
  status: 'draft',
  isActive: true,
  isFeatured: false,
  isNew: false,
  requiresShipping: true,
  isDigitalProduct: false,
  hasVariants: false,
  price: 0,
  images: [],
  categories: [],
  tags: [],
  inventory: {
    quantity: 0,
    trackInventory: true,
    allowBackorder: false,
    lowStockThreshold: 5,
  },
  seo: {
    metaKeywords: [],
  },
  relatedProducts: [],
  createdAt: new Date(),
  updatedAt: new Date(),
});

/**
 * Formats file size to human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Checks if a URL is an image
 */
export const isImageUrl = (url: string): boolean => {
  return /^https?:\/\//.test(url) && 
    /\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(url.split('?')[0]);
};

/**
 * Generates a random SKU
 */
export const generateSku = (prefix: string = 'SKU'): string => {
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `${prefix}-${random}`;
};