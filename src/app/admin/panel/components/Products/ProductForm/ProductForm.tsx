import React, { useState, useEffect } from 'react';
import { Product } from '../../../types/product.types';
import { useProductForm } from '../../../hooks/useProductForm';
import BasicInfoSection from './BasicInfoSection';
import PricingSection from './PricingSection';
import InventorySection from './InventorySection';
import VariantsSection from './VariantsSection';
import ImagesSection from './ImagesSection';
import SeoSection from './SeoSection';

// Props interface for ProductForm
interface ProductFormProps {
  initialData?: Product; // Optional initial data for editing
  onSuccess?: () => void; // Callback after successful submission
}

// Form data type derived from Product model
interface FormData {
  name: string;
  description: string | null;
  type: string;
  categoryId: string;
  gender: string | null;
  tags: string[];
  price: number;
  compareAtPrice: number | null;
  costPrice: number | null;
  totalStock: number;
  manageStock: boolean;
  isActive: boolean;
  variants: Array<{
    size: string | null;
    color: string | null;
    stock: number;
    price: number | null;
    image: string | null;
  }>;
  mainImage: string;
  images: string[];
  metaTitle: string | null;
  metaDescription: string | null;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSuccess }) => {
  // Initialize form state with default values or initial data
  const [formData, setFormData] = useState<FormData>({
    name: initialData?.name || '',
    description: initialData?.description || null,
    type: initialData?.type || '',
    categoryId: initialData?.categoryId || '',
    gender: initialData?.gender || null,
    tags: initialData?.tags || [],
    price: initialData?.price || 0,
    compareAtPrice: initialData?.compareAtPrice || null,
    costPrice: initialData?.costPrice || null,
    totalStock: initialData?.totalStock || 0,
    manageStock: initialData?.manageStock ?? true,
    isActive: initialData?.isActive ?? false,
    variants: initialData?.variants || [],
    mainImage: initialData?.mainImage || '',
    images: initialData?.images || [],
    metaTitle: initialData?.metaTitle || null,
    metaDescription: initialData?.metaDescription || null,
  });

  // State for form errors
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  // Hook for form submission
  const { submitProduct, isSubmitting, error } = useProductForm();

  // Handle form field changes
  const handleChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for the field on change
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Basic client-side validation
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.name) newErrors.name = 'نام محصول الزامی است';
    if (!formData.categoryId) newErrors.categoryId = 'دسته‌بندی الزامی است';
    if (formData.price <= 0) newErrors.price = 'قیمت باید بیشتر از صفر باشد';
    if (formData.totalStock < 0) newErrors.totalStock = 'موجودی نمی‌تواند منفی باشد';
    if (!formData.mainImage) newErrors.mainImage = 'تصویر اصلی الزامی است';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await submitProduct(formData);
      if (onSuccess) onSuccess();
      alert('محصول با موفقیت ثبت شد');
    } catch (err) {
      console.error('Error submitting product:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 dir-rtl">
      {/* Form Header */}
      <h2 className="text-2xl font-bold text-gray-800">
        {initialData ? 'ویرایش محصول' : 'ایجاد محصول جدید'}
      </h2>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded">
          خطا در ثبت محصول: {error}
        </div>
      )}

      {/* Basic Info Section */}
      <BasicInfoSection
        data={{
          name: formData.name,
          description: formData.description,
          type: formData.type,
          categoryId: formData.categoryId,
          gender: formData.gender,
          tags: formData.tags,
        }}
        errors={{
          name: errors.name,
          categoryId: errors.categoryId,
        }}
        onChange={(field, value) => handleChange(field as keyof FormData, value)}
      />

      {/* Pricing Section */}
      <PricingSection
        data={{
          price: formData.price,
          compareAtPrice: formData.compareAtPrice,
          costPrice: formData.costPrice,
        }}
        errors={{ price: errors.price }}
        onChange={(field, value) => handleChange(field as keyof FormData, value)}
      />

      {/* Inventory Section */}
      <InventorySection
        data={{
          totalStock: formData.totalStock,
          manageStock: formData.manageStock,
          isActive: formData.isActive,
        }}
        errors={{ totalStock: errors.totalStock }}
        onChange={(field, value) => handleChange(field as keyof FormData, value)}
      />

      {/* Variants Section */}
      <VariantsSection
        data={formData.variants}
        onChange={(variants) => handleChange('variants', variants)}
      />

      {/* Images Section */}
      <ImagesSection
        data={{
          mainImage: formData.mainImage,
          images: formData.images,
        }}
        errors={{ mainImage: errors.mainImage }}
        onChange={(field, value) => handleChange(field as keyof FormData, value)}
      />

      {/* SEO Section */}
      <SeoSection
        data={{
          metaTitle: formData.metaTitle,
          metaDescription: formData.metaDescription,
        }}
        onChange={(field, value) => handleChange(field as keyof FormData, value)}
      />

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
        >
          {isSubmitting ? 'در حال ثبت...' : 'ثبت محصول'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;