import React from 'react';
import { ProductType, Gender, Category } from '@prisma/client'; // Assuming Prisma client types are available

// Hook to fetch categories (assumed to exist in hooks/)
interface UseCategoriesResult {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
}
const useCategories = (): UseCategoriesResult => {
  // Placeholder: In a real implementation, this would fetch categories from the database
  return {
    categories: [],
    isLoading: false,
    error: null,
  };
};

// Props interface for BasicInfoSection
interface BasicInfoSectionProps {
  data: {
    name: string;
    description: string | null;
    type: string;
    categoryId: string;
    gender: string | null;
    tags: string[];
  };
  errors: {
    name?: string;
    categoryId?: string;
  };
  onChange: (field: keyof BasicInfoSectionProps['data'], value: any) => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ data, errors, onChange }) => {
  // Fetch categories for the category dropdown
  const { categories, isLoading: categoriesLoading, error: categoriesError } = useCategories();

  // ProductType and Gender enum values for dropdowns
  const productTypes = Object.values(ProductType);
  const genders = Object.values(Gender);

  // Handle tags input
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map((tag) => tag.trim()).filter(Boolean);
    onChange('tags', tags);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 dir-rtl">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">اطلاعات پایه</h3>

      {/* Name */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-2" htmlFor="name">
          نام محصول
        </label>
        <input
          id="name"
          type="text"
          value={data.name}
          onChange={(e) => onChange('name', e.target.value)}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
      </div>

      {/* Description */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-2" htmlFor="description">
          توضیحات
        </label>
        <textarea
          id="description"
          value={data.description || ''}
          onChange={(e) => onChange('description', e.target.value || null)}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
        />
      </div>

      {/* Product Type */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-2" htmlFor="type">
          نوع محصول
        </label>
        <select
          id="type"
          value={data.type}
          onChange={(e) => onChange('type', e.target.value)}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">انتخاب کنید</option>
          {productTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Category */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-2" htmlFor="categoryId">
          دسته‌بندی
        </label>
        <select
          id="categoryId"
          value={data.categoryId}
          onChange={(e) => onChange('categoryId', e.target.value)}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={categoriesLoading || !!categoriesError}
        >
          <option value="">انتخاب کنید</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {categoriesLoading && <p className="text-gray-600 text-sm mt-1">در حال بارگذاری دسته‌بندی‌ها...</p>}
        {categoriesError && <p className="text-red-600 text-sm mt-1">خطا در بارگذاری دسته‌بندی‌ها</p>}
        {errors.categoryId && <p className="text-red-600 text-sm mt-1">{errors.categoryId}</p>}
      </div>

      {/* Gender */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-2" htmlFor="gender">
          جنسیت
        </label>
        <select
          id="gender"
          value={data.gender || ''}
          onChange=(e) => onChange('gender', e.target.value || null)}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">انتخاب کنید</option>
          {genders.map((gender) => (
            <option key={gender} value={gender}>
              {gender}
            </option>
          ))}
        </select>
      </div>

      {/* Tags */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-2" htmlFor="tags">
          برچسب‌ها (با کاما جدا کنید)
        </label>
        <input
          id="tags"
          type="text"
          value={data.tags.join(', ')}
          onChange={handleTagsChange}
          placeholder="مثال: تابستانی، گاه به گاه"
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

export default BasicInfoSection;