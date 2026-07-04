import { ProductFormData } from '../types';

type ValidationResult = {
  isValid: boolean;
  errors: Record<string, string>;
};

export const validateProductForm = (values: Partial<ProductFormData>): ValidationResult => {
  const errors: Record<string, string> = {};
  
  // Name validation
  if (!values.name?.trim()) {
    errors.name = 'نام محصول الزامی است';
  } else if (values.name.length < 3) {
    errors.name = 'نام محصول باید حداقل ۳ کاراکتر باشد';
  } else if (values.name.length > 200) {
    errors.name = 'نام محصول نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد';
  }
  
  // SKU validation
  if (!values.sku?.trim()) {
    errors.sku = 'کد محصول الزامی است';
  } else if (!/^[a-zA-Z0-9-]+$/.test(values.sku)) {
    errors.sku = 'کد محصول فقط می‌تواند شامل حروف لاتین، اعداد و خط تیره باشد';
  }
  
  // Price validation
  if (values.price === undefined || values.price === null) {
    errors.price = 'قیمت الزامی است';
  } else if (isNaN(Number(values.price)) || values.price < 0) {
    errors.price = 'قیمت باید یک عدد معتبر و مثبت باشد';
  }
  
  // Compare at price validation
  if (values.compareAtPrice !== undefined && values.compareAtPrice !== null) {
    if (isNaN(Number(values.compareAtPrice)) || values.compareAtPrice < 0) {
      errors.compareAtPrice = 'قیمت مقایسه‌ای باید یک عدد معتبر و مثبت باشد';
    } else if (values.compareAtPrice <= (values.price || 0)) {
      errors.compareAtPrice = 'قیمت مقایسه‌ای باید بیشتر از قیمت اصلی باشد';
    }
  }
  
  // Description validation
  if (values.description && values.description.length > 5000) {
    errors.description = 'توضیحات نمی‌تواند بیشتر از ۵۰۰۰ کاراکتر باشد';
  }
  
  // Stock validation
  if (values.inventory?.quantity !== undefined) {
    if (isNaN(Number(values.inventory.quantity)) || values.inventory.quantity < 0) {
      errors['inventory.quantity'] = 'تعداد موجودی باید یک عدد معتبر و مثبت باشد';
    }
  }
  
  // Weight validation
  if (values.weight !== undefined) {
    if (isNaN(Number(values.weight)) || values.weight < 0) {
      errors.weight = 'وزن باید یک عدد معتبر و مثبت باشد';
    }
  }
  
  // Images validation
  if (values.images && values.images.length === 0) {
    errors.images = 'حداقل یک تصویر برای محصول الزامی است';
  } else if (values.images && values.images.length > 10) {
    errors.images = 'حداکثر ۱۰ تصویر می‌توانید آپلود کنید';
  }
  
  // Categories validation
  if (!values.categories?.length) {
    errors.categories = 'حداقل یک دسته‌بندی انتخاب کنید';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateVariant = (variant: any) => {
  const errors: Record<string, string> = {};
  
  if (!variant.sku?.trim()) {
    errors.sku = 'کد محصول متغیر الزامی است';
  }
  
  if (variant.price === undefined || variant.price === null) {
    errors.price = 'قیمت الزامی است';
  } else if (isNaN(Number(variant.price)) || variant.price < 0) {
    errors.price = 'قیمت باید یک عدد معتبر و مثبت باشد';
  }
  
  if (variant.quantity !== undefined && (isNaN(Number(variant.quantity)) || variant.quantity < 0)) {
    errors.quantity = 'تعداد باید یک عدد معتبر و مثبت باشد';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};