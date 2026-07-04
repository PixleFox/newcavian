import { useState, useEffect, useCallback } from 'react';
import { Product, ProductFormData, ProductVariant, ProductImage } from '../types';
import { validateProductForm, validateVariant } from '../utils/validation';
import { generateSku, createNewProduct } from '../utils/productUtils';

type UseProductFormProps = {
  initialData?: Partial<Product>;
  onSubmit: (data: FormData) => Promise<void>;
};

type FormErrors = Record<string, string>;
type FormImage = string | File | ProductImage;

// Helper function to get image URL from different source types
const getImageUrl = (img: FormImage): string => {
  if (typeof img === 'string') return img;
  if (img instanceof File) return URL.createObjectURL(img);
  return img.url || '';
};

// Helper to convert ProductImage to FormData compatible format
const toFormDataImage = (img: FormImage): string | File => {
  if (typeof img === 'string') return img;
  if (img instanceof File) return img;
  return img.file || img.url || '';
};

export const useProductForm = ({ initialData, onSubmit }: UseProductFormProps) => {
  const [formData, setFormData] = useState<Partial<ProductFormData>>(
    initialData ? {
      ...initialData,
      // Convert ProductImage[] to (string | File)[]
      images: initialData.images?.map(img => toFormDataImage(img as FormImage)) || []
    } : createNewProduct()
  );
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [variantErrors, setVariantErrors] = useState<FormErrors[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Initialize form with initial data
  useEffect(() => {
    if (initialData) {
      // Set image previews from initial data
      if (initialData.images) {
        const previews = initialData.images
          .map(img => getImageUrl(img as FormImage))
          .filter((url): url is string => !!url);
        setImagePreviews(previews);
      }
      
      // Set variants if they exist
      if (initialData.variants) {
        setVariants(initialData.variants);
        setVariantErrors(initialData.variants.map(() => ({})));
      }
    }
  }, [initialData]);

  // Handle input changes
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? Number(value) : undefined) : value,
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  // Handle checkbox changes
  const handleCheckboxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  }, []);

  // Handle image upload
  const handleImageUpload = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isValidType && isValidSize;
    });
    
    if (validFiles.length === 0) {
      setErrors(prev => ({
        ...prev,
        images: 'فایل‌های معتبر انتخاب کنید (حداکثر 5 مگابایت، فرمت‌های مجاز: JPG، PNG، WebP)'
      }));
      return;
    }
    
    // Create previews
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
    
    // Update form data with new files
    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || []), ...validFiles],
    }));
    
    // Clear any previous image errors
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.images;
      return newErrors;
    });
  }, []);
