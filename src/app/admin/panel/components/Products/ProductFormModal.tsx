'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { XMarkIcon, TrashIcon, ArrowUpTrayIcon, PlusIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Category { id: string; name: string; }

interface ImageItem { url: string; file?: File; uploading?: boolean; }

const ALL_SIZES = ['XS','S','M','L','XL','XXL','XXXL','XXXXL','ONE_SIZE'];
const SZ_LABEL: Record<string,string> = { XS:'XS', S:'S', M:'M', L:'L', XL:'XL', XXL:'2XL', XXXL:'3XL', XXXXL:'4XL', ONE_SIZE:'یه‌سایز' };

interface FormState {
  name: string;
  description: string;
  type: string;
  categoryId: string;
  gender: string;
  status: 'draft' | 'active' | 'archived';
  price: string;
  compareAtPrice: string;
  costPrice: string;
  totalStock: string;
  isFeatured: boolean;
  isNew: boolean;
  tags: string;
  metaTitle: string;
  metaDescription: string;
}

interface VariantRow {
  id?: string;
  size: string;
  color: string;
  colorHex: string;
  stock: string;
  price: string;
  sku: string;
}

interface ClothingAttrs {
  fabricType: string;
  fit: string;
  sleeveType: string;
  neckType: string;
  pattern: string;
  care: string;
  origin: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PRODUCT_TYPES = [
  { value: 'T_SHIRT', label: 'تی‌شرت' },
  { value: 'HOODIE', label: 'هودی' },
  { value: 'SWEATSHIRT', label: 'سوئت‌شرت' },
  { value: 'POLO', label: 'پولو' },
  { value: 'TANK_TOP', label: 'رکابی' },
  { value: 'LONGSLEEVE', label: 'آستین‌بلند' },
  { value: 'MUG', label: 'ماگ' },
  { value: 'SOCKS', label: 'جوراب' },
  { value: 'HAT', label: 'کلاه' },
  { value: 'TOTE_BAG', label: 'توت‌بگ' },
  { value: 'ACCESSORY', label: 'اکسسوری' },
];

const GENDERS = [
  { value: '', label: 'انتخاب نشده' },
  { value: 'MEN', label: 'مردانه' },
  { value: 'WOMEN', label: 'زنانه' },
  { value: 'UNISEX', label: 'یونیسکس' },
  { value: 'KIDS', label: 'بچگانه' },
];

const STATUS_OPTIONS = [
  { value: 'draft', label: 'پیش‌نویس', desc: 'ذخیره بدون نمایش', color: 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10' },
  { value: 'active', label: 'فعال', desc: 'نمایش در فروشگاه', color: 'text-green-400 border-green-500/50 bg-green-500/10' },
  { value: 'archived', label: 'آرشیو', desc: 'پنهان از دید مشتری', color: 'text-gray-400 border-gray-500/50 bg-gray-500/10' },
];

const SIZES = ['XS','S','M','L','XL','XXL','XXXL','XXXXL','ONE_SIZE'];
const SIZE_LABEL: Record<string,string> = { XS:'XS', S:'S', M:'M', L:'L', XL:'XL', XXL:'2XL', XXXL:'3XL', XXXXL:'4XL', ONE_SIZE:'یه‌سایز' };

const PRESET_COLORS = [
  { name: 'black',  hex: '#111111', label: 'مشکی' },
  { name: 'white',  hex: '#f5f5f5', label: 'سفید' },
  { name: 'red',    hex: '#dc2626', label: 'قرمز' },
  { name: 'navy',   hex: '#1e3a5f', label: 'سرمه‌ای' },
  { name: 'gray',   hex: '#6b7280', label: 'خاکستری' },
  { name: 'blue',   hex: '#3b82f6', label: 'آبی' },
  { name: 'green',  hex: '#16a34a', label: 'سبز' },
  { name: 'purple', hex: '#9333ea', label: 'بنفش' },
  { name: 'orange', hex: '#f97316', label: 'نارنجی' },
  { name: 'pink',   hex: '#ec4899', label: 'صورتی' },
];

const DEFAULT_CLOTHING: ClothingAttrs = {
  fabricType: '', fit: '', sleeveType: '', neckType: '', pattern: '', care: '', origin: '',
};

const DEFAULT: FormState = {
  name: '', description: '', type: 'T_SHIRT', categoryId: '',
  gender: '', status: 'draft', price: '', compareAtPrice: '',
  costPrice: '', totalStock: '0', isFeatured: false, isNew: true,
  tags: '', metaTitle: '', metaDescription: '',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Field({ label, required, children, hint }: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

const inputCls = 'w-full bg-[#1e2535] border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none placeholder-gray-500 transition-colors';
const selectCls = inputCls + ' cursor-pointer';

// ─── Image Uploader ───────────────────────────────────────────────────────────

function ImageUploader({ images, onAdd, onRemove, onSetMain, mainIndex }: {
  images: ImageItem[];
  onAdd: (files: FileList) => void;
  onRemove: (i: number) => void;
  onSetMain: (i: number) => void;
  mainIndex: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) onAdd(e.dataTransfer.files);
  }, [onAdd]);

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          dragging ? 'border-purple-500 bg-purple-500/10' : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/30'
        }`}
      >
        <ArrowUpTrayIcon className="h-8 w-8 text-gray-500 mx-auto mb-2" />
        <p className="text-sm text-gray-400">فایل را اینجا بکشید یا <span className="text-purple-400 font-medium">انتخاب کنید</span></p>
        <p className="text-xs text-gray-600 mt-1">JPG، PNG، WebP — حداکثر ۵ مگابایت</p>
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => e.target.files && onAdd(e.target.files)} />
      </div>

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((img, i) => (
            <div
              key={i}
              onClick={() => onSetMain(i)}
              className={`relative group aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                i === mainIndex ? 'border-purple-500' : 'border-transparent hover:border-gray-500'
              }`}
            >
              {img.uploading ? (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              )}

              {/* Main badge */}
              {i === mainIndex && (
                <div className="absolute top-1 right-1">
                  <CheckCircleIcon className="h-5 w-5 text-purple-400 drop-shadow" />
                </div>
              )}

              {/* Delete */}
              <button
                type="button"
                onClick={e => { e.stopPropagation(); onRemove(i); }}
                className="absolute top-1 left-1 bg-red-600/80 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <TrashIcon className="h-3.5 w-3.5 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}
      {images.length > 0 && (
        <p className="text-xs text-gray-500">روی تصویر کلیک کنید تا به عنوان تصویر اصلی انتخاب شود</p>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  product?: any;
  onClose: () => void;
  onSaved: () => void;
}

export default function ProductFormModal({ product, onClose, onSaved }: Props) {
  const isEdit = !!product;

  const [form, setForm] = useState<FormState>(() => {
    if (!product) return DEFAULT;
    return {
      name: product.name || '',
      description: product.description || '',
      type: product.type || 'T_SHIRT',
      categoryId: product.categoryId || product.category?.id || '',
      gender: product.gender || '',
      status: product.isActive ? 'active' : 'draft',
      price: product.price?.toString() || '',
      compareAtPrice: product.compareAtPrice?.toString() || '',
      costPrice: product.costPrice?.toString() || '',
      totalStock: product.totalStock?.toString() || '0',
      isFeatured: product.isFeatured ?? false,
      isNew: product.isNew ?? false,
      tags: (product.tags || []).join(', '),
      metaTitle: product.metaTitle || '',
      metaDescription: product.metaDescription || '',
    };
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<{ id: string; name: string }[]>([]);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>(() =>
    (product?.collections || []).map((pc: any) => pc.collectionId || pc.collection?.id || pc.id).filter(Boolean)
  );
  const [images, setImages] = useState<ImageItem[]>(() => {
    const imgs: ImageItem[] = [];
    if (product?.mainImage) imgs.push({ url: product.mainImage });
    (product?.images || []).forEach((u: string) => { if (u !== product?.mainImage) imgs.push({ url: u }); });
    return imgs;
  });
  const [mainIndex, setMainIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  // Variants
  const [variants, setVariants] = useState<VariantRow[]>(() =>
    (product?.variants || []).map((v: any) => ({
      id: v.id,
      size: v.size || '',
      color: v.color || '',
      colorHex: v.colorHex || '',
      stock: String(v.stock ?? 0),
      price: String(v.price ?? ''),
      sku: v.sku || '',
    }))
  );

  // Available sizes (simple, no variant detail)
  const [availableSizes, setAvailableSizes] = useState<string[]>(
    product?.availableSizes || []
  );

  // Clothing attributes
  const [clothing, setClothing] = useState<ClothingAttrs>(() => ({
    fabricType: product?.clothingAttributes?.fabricType || '',
    fit: product?.clothingAttributes?.fit || '',
    sleeveType: product?.clothingAttributes?.sleeveType || '',
    neckType: product?.clothingAttributes?.neckType || '',
    pattern: product?.clothingAttributes?.pattern || '',
    care: product?.clothingAttributes?.care || '',
    origin: product?.clothingAttributes?.origin || '',
  }));

  useEffect(() => {
    fetch('/api/admin/products/categories', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.success) setCategories(d.data || []); })
      .catch(() => {});
    fetch('/api/admin/collections', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setCollections(d); })
      .catch(() => {});
  }, []);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(p => { const n = { ...p }; delete n[k]; return n; });
  };

  // ── Image upload ──────────────────────────────────────────────────────────

  const handleAddImages = useCallback(async (files: FileList) => {
    const arr = Array.from(files).filter(f => f.size <= 5 * 1024 * 1024);
    if (arr.length < files.length) toast.error('برخی فایل‌ها حذف شدند (بیش از ۵ مگابایت)');

    const placeholders: ImageItem[] = arr.map(() => ({ url: '', uploading: true }));
    setImages(prev => [...prev, ...placeholders]);
    const startIdx = images.length;

    await Promise.all(arr.map(async (file, i) => {
      try {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/admin/upload', { method: 'POST', credentials: 'include', body: fd });
        const data = await res.json();
        if (data.success) {
          setImages(prev => {
            const next = [...prev];
            next[startIdx + i] = { url: data.url };
            return next;
          });
        } else {
          toast.error(`آپلود ${file.name} ناموفق بود`);
          setImages(prev => prev.filter((_, idx) => idx !== startIdx + i));
        }
      } catch {
        toast.error(`خطا در آپلود ${file.name}`);
      }
    }));
  }, [images.length]);

  const handleRemoveImage = (i: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== i));
    if (mainIndex >= i && mainIndex > 0) setMainIndex(m => m - 1);
  };

  // ── Validate ──────────────────────────────────────────────────────────────

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = 'نام محصول الزامی است';
    if (!form.categoryId) e.categoryId = 'دسته‌بندی الزامی است';
    if (!form.price || Number(form.price) <= 0) e.price = 'قیمت باید بیشتر از صفر باشد';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) { toast.error('لطفاً فیلدهای اجباری را تکمیل کنید'); return; }

    const readyImages = images.filter(img => img.url && !img.uploading);
    const mainImage = readyImages[mainIndex]?.url || readyImages[0]?.url || null;
    const otherImages = readyImages.filter((_, i) => i !== mainIndex).map(i => i.url);

    setSaving(true);
    try {
      const slug = isEdit
        ? product.slug
        : `${form.name.toLowerCase().replace(/[\s]+/g, '-').replace(/[^a-z0-9-]/g, '') || 'product'}-${Date.now()}`;

      // Build variants payload — auto-generate SKU if empty
      const variantsPayload = variants
        .filter(v => v.size || v.color)
        .map(v => ({
          ...(v.id ? { id: v.id } : {}),
          size: v.size || null,
          color: v.color || null,
          colorHex: v.colorHex || null,
          stock: Number(v.stock) || 0,
          price: v.price ? Number(v.price) : null,
          sku: v.sku || `${form.name.slice(0,4).toUpperCase().replace(/\s/g,'')}-${v.size}-${v.color}-${Date.now()}`.replace(/[^A-Za-z0-9-]/g,''),
          isActive: true,
        }));

      // Total stock = sum of variant stocks, or manual if no variants
      const derivedStock = variantsPayload.length > 0
        ? variantsPayload.reduce((s, v) => s + v.stock, 0)
        : Number(form.totalStock) || 0;

      const body = {
        name: form.name.trim(),
        slug,
        description: form.description || null,
        type: form.type,
        categoryId: form.categoryId,
        gender: form.gender || null,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        price: Number(form.price),
        compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
        costPrice: form.costPrice ? Number(form.costPrice) : null,
        totalStock: derivedStock,
        isActive: form.status === 'active',
        isFeatured: form.isFeatured,
        isNew: form.isNew,
        mainImage,
        images: otherImages,
        metaTitle: form.metaTitle || null,
        metaDescription: form.metaDescription || null,
        availableSizes,
        variants: variantsPayload,
        clothingAttributes: form.type === 'T_SHIRT' ? {
          fabricType: clothing.fabricType || null,
          fit: clothing.fit || null,
          sleeveType: clothing.sleeveType || null,
          neckType: clothing.neckType || null,
          pattern: clothing.pattern || null,
          care: clothing.care || null,
          origin: clothing.origin || null,
        } : undefined,
      };

      const url = isEdit ? `/api/admin/products/${product.id}` : '/api/admin/products';
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.success) {
        const productId = isEdit ? product.id : data.data?.id;
        if (productId && collections.length > 0) {
          // Sync collections: for each collection, PATCH to add/remove this product
          await Promise.all(collections.map(async (col) => {
            const inCollection = selectedCollectionIds.includes(col.id);
            const currentIds: string[] = (col.products || []).map((p: any) => p.productId || p.id);
            const alreadyIn = currentIds.includes(productId);
            if (inCollection === alreadyIn) return;
            const newIds = inCollection
              ? [...currentIds, productId]
              : currentIds.filter((id: string) => id !== productId);
            await fetch(`/api/admin/collections/${col.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ productIds: newIds }),
            });
          }));
        }
        toast.success(isEdit ? 'محصول ویرایش شد' : 'محصول اضافه شد');
        onSaved();
      } else {
        toast.error(data.message || data.error || 'خطا در ذخیره');
      }
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-start justify-center overflow-y-auto p-4" dir="rtl">
      <div className="bg-[#0f172a] border border-gray-800 rounded-2xl w-full max-w-3xl my-8 shadow-2xl" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div>
            <h2 className="text-lg font-bold text-white">{isEdit ? 'ویرایش محصول' : 'افزودن محصول جدید'}</h2>
            <p className="text-xs text-gray-500 mt-0.5">فیلدهای ستاره‌دار اجباری هستند</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-800">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">

            {/* ── وضعیت ── */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">وضعیت <span className="text-red-400">*</span></label>
              <div className="grid grid-cols-3 gap-2">
                {STATUS_OPTIONS.map(s => (
                  <button
                    key={s.value} type="button"
                    onClick={() => set('status', s.value as FormState['status'])}
                    className={`border rounded-xl p-3 text-right transition-all ${
                      form.status === s.value ? s.color : 'border-gray-700 bg-gray-800/50 hover:bg-gray-800'
                    }`}
                  >
                    <div className={`text-sm font-semibold ${form.status === s.value ? '' : 'text-gray-300'}`}>{s.label}</div>
                    <div className={`text-xs mt-0.5 ${form.status === s.value ? 'opacity-80' : 'text-gray-500'}`}>{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-gray-800" />

            {/* ── اطلاعات اصلی ── */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Field label="نام محصول" required>
                  <input
                    className={`${inputCls} ${errors.name ? 'border-red-500' : ''}`}
                    value={form.name} onChange={e => set('name', e.target.value)}
                    placeholder="مثال: تی‌شرت یقه گرد سفید"
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
                </Field>
              </div>

              <Field label="نوع محصول">
                <select className={selectCls} value={form.type} onChange={e => set('type', e.target.value)}>
                  {PRODUCT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </Field>

              <Field label="دسته‌بندی" required>
                <select className={`${selectCls} ${errors.categoryId ? 'border-red-500' : ''}`} value={form.categoryId} onChange={e => set('categoryId', e.target.value)}>
                  <option value="">انتخاب دسته‌بندی</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.categoryId && <p className="mt-1 text-xs text-red-400">{errors.categoryId}</p>}
              </Field>

              <Field label="جنسیت">
                <select className={selectCls} value={form.gender} onChange={e => set('gender', e.target.value)}>
                  {GENDERS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </Field>

              <div className="col-span-2">
                <Field label="توضیحات">
                  <textarea
                    className={`${inputCls} resize-none`} rows={3}
                    value={form.description} onChange={e => set('description', e.target.value)}
                    placeholder="توضیح کوتاهی از محصول..."
                  />
                </Field>
              </div>
            </div>

            <div className="h-px bg-gray-800" />

            {/* ── قیمت و موجودی ── */}
            <div>
              <p className="text-sm font-semibold text-gray-400 mb-3">قیمت و موجودی</p>
              <div className="grid grid-cols-3 gap-4">
                <Field label="قیمت فروش (تومان)" required>
                  <input
                    type="number" min="0" className={`${inputCls} ${errors.price ? 'border-red-500' : ''}`}
                    value={form.price} onChange={e => set('price', e.target.value)} placeholder="مثال: 350000"
                  />
                  {errors.price && <p className="mt-1 text-xs text-red-400">{errors.price}</p>}
                </Field>
                <Field label="قیمت قبل از تخفیف" hint="اختیاری — برای نمایش خط خورده">
                  <input type="number" min="0" className={inputCls} value={form.compareAtPrice} onChange={e => set('compareAtPrice', e.target.value)} placeholder="0" />
                </Field>
                <Field label="موجودی (عدد)">
                  <input type="number" min="0" className={inputCls} value={form.totalStock} onChange={e => set('totalStock', e.target.value)} />
                </Field>
              </div>
            </div>

            <div className="h-px bg-gray-800" />

            {/* ── تصاویر ── */}
            <div>
              <p className="text-sm font-semibold text-gray-400 mb-3">تصاویر محصول</p>
              <ImageUploader
                images={images}
                onAdd={handleAddImages}
                onRemove={handleRemoveImage}
                onSetMain={setMainIndex}
                mainIndex={mainIndex}
              />
            </div>

            <div className="h-px bg-gray-800" />

            {/* ── سایزبندی ── */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-gray-200">سایزهای موجود</p>
                <button type="button"
                  onClick={() => setAvailableSizes(ALL_SIZES.filter(s => s !== 'ONE_SIZE'))}
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                  انتخاب همه
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                سایزهایی که این محصول دارد را انتخاب کنید. اگر واریانت تعریف کرده باشید، اولویت با واریانت‌هاست.
              </p>
              <div className="flex flex-wrap gap-2">
                {ALL_SIZES.map(sz => {
                  const active = availableSizes.includes(sz);
                  return (
                    <button key={sz} type="button"
                      onClick={() => setAvailableSizes(prev =>
                        active ? prev.filter(s => s !== sz) : [...prev, sz]
                      )}
                      className={`min-w-[48px] h-10 px-3 rounded-xl text-sm font-bold border transition-all ${
                        active
                          ? 'bg-purple-500/20 border-purple-500/60 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                          : 'bg-white/[0.03] border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300'
                      }`}>
                      {SZ_LABEL[sz] ?? sz}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="h-px bg-gray-800" />

            {/* ── واریانت‌ها (سایز / رنگ) ── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-gray-200">واریانت‌ها (سایز و رنگ)</p>
                  <p className="text-xs text-gray-500 mt-0.5">هر ترکیب سایز+رنگ یک واریانت جداگانه‌ست. موجودی کل از جمع واریانت‌ها محاسبه می‌شه.</p>
                </div>
                <button type="button"
                  onClick={() => setVariants(v => [...v, { size: 'M', color: 'black', colorHex: '#111111', stock: '0', price: '', sku: '' }])}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-600/40 text-purple-300 text-xs font-bold rounded-lg transition-all">
                  <PlusIcon className="h-3.5 w-3.5" /> افزودن واریانت
                </button>
              </div>

              {variants.length === 0 ? (
                <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center">
                  <p className="text-sm text-gray-500">واریانتی ندارید. برای محصول با چند سایز/رنگ، واریانت اضافه کنید.</p>
                  <p className="text-xs text-gray-600 mt-1">بدون واریانت: موجودی کل همان عدد وارد شده در قسمت بالاست.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Header */}
                  <div className="grid grid-cols-[80px_130px_100px_80px_100px_36px] gap-2 text-xs text-gray-500 font-medium px-1">
                    <span>سایز</span><span>رنگ</span><span>کد رنگ (hex)</span><span>موجودی</span><span>قیمت (تومان)</span><span></span>
                  </div>
                  {variants.map((v, i) => (
                    <div key={i} className="grid grid-cols-[80px_130px_100px_80px_100px_36px] gap-2 items-center bg-gray-800/50 rounded-xl p-2">
                      {/* Size */}
                      <select value={v.size}
                        onChange={e => setVariants(vs => vs.map((r,j) => j===i ? {...r, size: e.target.value} : r))}
                        className="bg-[#1e2535] border border-gray-700 text-white rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-purple-500 outline-none">
                        {SIZES.map(s => <option key={s} value={s}>{SIZE_LABEL[s] ?? s}</option>)}
                      </select>

                      {/* Color picker + name */}
                      <div className="flex items-center gap-1.5">
                        <div className="relative">
                          <div className="w-6 h-6 rounded-full border border-white/20 cursor-pointer overflow-hidden flex-shrink-0"
                            style={{ background: v.colorHex || v.color || '#888' }}>
                            <input type="color" value={v.colorHex || '#111111'}
                              onChange={e => setVariants(vs => vs.map((r,j) => j===i ? {...r, colorHex: e.target.value} : r))}
                              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" />
                          </div>
                        </div>
                        <select value={v.color}
                          onChange={e => {
                            const preset = PRESET_COLORS.find(c => c.name === e.target.value);
                            setVariants(vs => vs.map((r,j) => j===i ? {...r, color: e.target.value, colorHex: preset?.hex || r.colorHex} : r));
                          }}
                          className="flex-1 bg-[#1e2535] border border-gray-700 text-white rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-purple-500 outline-none">
                          <option value="">رنگ...</option>
                          {PRESET_COLORS.map(c => <option key={c.name} value={c.name}>{c.label}</option>)}
                          <option value="custom">سفارشی</option>
                        </select>
                      </div>

                      {/* Hex manual */}
                      <input value={v.colorHex}
                        onChange={e => setVariants(vs => vs.map((r,j) => j===i ? {...r, colorHex: e.target.value} : r))}
                        className="bg-[#1e2535] border border-gray-700 text-white rounded-lg px-2 py-1.5 text-xs font-mono focus:ring-1 focus:ring-purple-500 outline-none"
                        placeholder="#111111" />

                      {/* Stock */}
                      <input type="number" min="0" value={v.stock}
                        onChange={e => setVariants(vs => vs.map((r,j) => j===i ? {...r, stock: e.target.value} : r))}
                        className="bg-[#1e2535] border border-gray-700 text-white rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-purple-500 outline-none" />

                      {/* Price */}
                      <input type="number" min="0" value={v.price}
                        onChange={e => setVariants(vs => vs.map((r,j) => j===i ? {...r, price: e.target.value} : r))}
                        placeholder={form.price || '—'}
                        className="bg-[#1e2535] border border-gray-700 text-white rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-purple-500 outline-none" />

                      {/* Delete */}
                      <button type="button" onClick={() => setVariants(vs => vs.filter((_,j) => j!==i))}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  {/* Quick add all sizes for a color */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className="text-xs text-gray-600 self-center ml-1">افزودن سریع:</span>
                    {PRESET_COLORS.slice(0,5).map(c => (
                      <button key={c.name} type="button"
                        onClick={() => {
                          const newRows: VariantRow[] = ['S','M','L','XL','XXL'].map(sz => ({
                            size: sz, color: c.name, colorHex: c.hex, stock: '0', price: '', sku: '',
                          }));
                          setVariants(vs => [...vs, ...newRows]);
                        }}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all border border-gray-700">
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: c.hex }} />
                        {c.label} (S→2XL)
                      </button>
                    ))}
                  </div>

                  {/* Total stock preview */}
                  <div className="flex justify-between items-center mt-1 px-1">
                    <span className="text-xs text-gray-600">مجموع موجودی از واریانت‌ها:</span>
                    <span className="text-sm font-bold text-green-400">
                      {variants.reduce((s,v) => s + (Number(v.stock)||0), 0)} عدد
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="h-px bg-gray-800" />

            {/* ── مشخصات تی‌شرت ── */}
            {form.type === 'T_SHIRT' && (
              <div>
                <p className="text-sm font-semibold text-gray-200 mb-3">مشخصات تی‌شرت</p>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="جنس پارچه" hint="مثال: ۱۰۰٪ پنبه، پلی‌استر، ترکیبی">
                    <input className={inputCls} value={clothing.fabricType}
                      onChange={e => setClothing(c => ({...c, fabricType: e.target.value}))}
                      placeholder="مثال: ۱۰۰٪ پنبه" />
                  </Field>
                  <Field label="برش (Fit)">
                    <select className={selectCls} value={clothing.fit} onChange={e => setClothing(c => ({...c, fit: e.target.value}))}>
                      <option value="">انتخاب کنید</option>
                      {['Slim Fit','Regular Fit','Oversize','Loose','Fitted'].map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </Field>
                  <Field label="نوع آستین">
                    <select className={selectCls} value={clothing.sleeveType} onChange={e => setClothing(c => ({...c, sleeveType: e.target.value}))}>
                      <option value="">انتخاب کنید</option>
                      {['کوتاه','بلند','بدون آستین','سه‌ربع'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>
                  <Field label="نوع یقه">
                    <select className={selectCls} value={clothing.neckType} onChange={e => setClothing(c => ({...c, neckType: e.target.value}))}>
                      <option value="">انتخاب کنید</option>
                      {['یقه گرد','یقه V','یقه هفت','یقه پولو','یقه هودی'].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </Field>
                  <Field label="طرح (Pattern)">
                    <select className={selectCls} value={clothing.pattern} onChange={e => setClothing(c => ({...c, pattern: e.target.value}))}>
                      <option value="">انتخاب کنید</option>
                      {['ساده','چاپ دیجیتال','طرح‌دار','راه‌راه','گلدار'].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </Field>
                  <Field label="کشور تولید">
                    <input className={inputCls} value={clothing.origin}
                      onChange={e => setClothing(c => ({...c, origin: e.target.value}))}
                      placeholder="مثال: ایران" />
                  </Field>
                  <div className="col-span-2">
                    <Field label="دستورالعمل نگهداری" hint="مثال: شستشو با آب ۳۰ درجه، اتو از پشت طرح">
                      <textarea className={`${inputCls} resize-none`} rows={2} value={clothing.care}
                        onChange={e => setClothing(c => ({...c, care: e.target.value}))}
                        placeholder="مثال: شستشو با آب سرد، نشورید در لباسشویی با دمای بالا" />
                    </Field>
                  </div>
                </div>
              </div>
            )}

            {form.type === 'T_SHIRT' && <div className="h-px bg-gray-800" />}

            {/* ── ویژگی‌ها ── */}
            <div className="flex gap-6">
              {[
                { k: 'isFeatured', label: 'محصول ویژه', desc: 'نمایش در بخش ویژه' },
                { k: 'isNew', label: 'جدید', desc: 'نشان‌گذاری به‌عنوان جدید' },
              ].map(({ k, label, desc }) => (
                <label key={k} className="flex items-start gap-3 cursor-pointer group">
                  <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    form[k as keyof FormState] ? 'bg-purple-600 border-purple-600' : 'border-gray-600 group-hover:border-gray-400'
                  }`} onClick={() => set(k as keyof FormState, !form[k as keyof FormState] as any)}>
                    {form[k as keyof FormState] && <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <div>
                    <div className="text-sm text-gray-200">{label}</div>
                    <div className="text-xs text-gray-500">{desc}</div>
                  </div>
                </label>
              ))}
            </div>

            {/* ── کالکشن‌ها ── */}
            {collections.length > 0 && (
              <div>
                <div className="text-sm text-gray-400 mb-2">کالکشن‌ها</div>
                <div className="flex flex-wrap gap-2">
                  {collections.map((col) => {
                    const active = selectedCollectionIds.includes(col.id);
                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => setSelectedCollectionIds(prev =>
                          active ? prev.filter(id => id !== col.id) : [...prev, col.id]
                        )}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                          active
                            ? 'bg-purple-600 border-purple-500 text-white'
                            : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200'
                        }`}
                      >
                        {col.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── بخش پیشرفته ── */}
            <details className="group">
              <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-300 select-none list-none flex items-center gap-2">
                <svg className="w-4 h-4 transition-transform group-open:rotate-90" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                تنظیمات پیشرفته (تگ‌ها، قیمت تمام‌شده، سئو)
              </summary>
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="قیمت تمام‌شده" hint="برای محاسبه سود — نشان داده نمی‌شود">
                    <input type="number" min="0" className={inputCls} value={form.costPrice} onChange={e => set('costPrice', e.target.value)} placeholder="0" />
                  </Field>
                  <Field label="تگ‌ها" hint="با ویرگول جدا کنید">
                    <input className={inputCls} value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="اسپرت, تابستانه, مردانه" />
                  </Field>
                </div>
                <Field label="عنوان سئو">
                  <input className={inputCls} value={form.metaTitle} onChange={e => set('metaTitle', e.target.value)} placeholder="عنوان برای موتورهای جستجو" />
                </Field>
                <Field label="توضیحات سئو">
                  <textarea className={`${inputCls} resize-none`} rows={2} value={form.metaDescription} onChange={e => set('metaDescription', e.target.value)} placeholder="توضیح کوتاه برای موتورهای جستجو" />
                </Field>
              </div>
            </details>

          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 border-t border-gray-800 bg-gray-900/50 rounded-b-2xl">
            <button
              type="submit" disabled={saving || images.some(i => i.uploading)}
              className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
            >
              {saving ? 'در حال ذخیره...' : isEdit ? 'ذخیره تغییرات' : 'افزودن محصول'}
            </button>
            <button type="button" onClick={onClose} className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors">
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
