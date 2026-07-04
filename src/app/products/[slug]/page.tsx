'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  Heart, ShoppingCart, ChevronRight, ChevronLeft,
  CheckCircle, AlertCircle, Truck, RotateCcw, Shield, Ruler,
  Share2, X, ZoomIn,
} from 'lucide-react';
import { use } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Variant {
  id: string;
  size: string | null;
  color: string | null;
  colorHex: string | null;
  price: string | null;
  stock: number;
  image: string | null;
  sku: string;
}

interface ClothingAttrs {
  fit: string | null;
  sleeveType: string | null;
  neckType: string | null;
  pattern: string | null;
  care: string | null;
  fabricType: string | null;
  material: string | null;
  origin: string | null;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  compareAtPrice: string | null;
  mainImage: string | null;
  images: string[];
  totalStock: number;
  isNew: boolean;
  isFeatured: boolean;
  gender: string | null;
  material: string | null;
  availableSizes: string[];
  weight: number | null;
  tags: string[];
  type: string;
  category: { id: string; name: string; slug: string };
  variants: Variant[];
  clothingAttributes: ClothingAttrs | null;
  sizeGuide: { content: unknown } | null;
}

interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  price: string;
  compareAtPrice: string | null;
  mainImage: string | null;
  images: string[];
  isNew: boolean;
  totalStock: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number | string) =>
  new Intl.NumberFormat('fa-IR').format(typeof n === 'string' ? parseFloat(n) : n);

function fixImg(p?: string | null) {
  if (!p) return null;
  if (p.startsWith('/api/')) return p;
  if (p.startsWith('/uploads/')) return '/api' + p;
  if (p.startsWith('uploads/')) return '/api/' + p;
  if (p.startsWith('api/')) return '/' + p;
  return p;
}

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL', 'ONE_SIZE'];
const SIZE_LABEL: Record<string, string> = {
  XS: 'XS', S: 'S', M: 'M', L: 'L', XL: 'XL',
  XXL: '2XL', XXXL: '3XL', XXXXL: '4XL', ONE_SIZE: 'یه‌سایز',
  XS_S: 'XS-S', S_M: 'S-M', L_XL: 'L-XL', XL_XXL: 'XL-2XL',
};
const COLOR_FA: Record<string, string> = {
  black: 'مشکی', white: 'سفید', red: 'قرمز', blue: 'آبی', green: 'سبز',
  yellow: 'زرد', purple: 'بنفش', gray: 'خاکستری', navy: 'سرمه‌ای',
  orange: 'نارنجی', pink: 'صورتی', brown: 'قهوه‌ای',
};
const COLOR_HEX: Record<string, string> = {
  black: '#111', white: '#f5f5f5', red: '#dc2626', blue: '#3b82f6',
  green: '#16a34a', yellow: '#eab308', purple: '#9333ea', gray: '#6b7280',
  navy: '#1e3a5f', orange: '#f97316', pink: '#ec4899', brown: '#92400e',
};

// ─── Image Lightbox ───────────────────────────────────────────────────────────

function Lightbox({ images, index, onClose }: { images: string[]; index: number; onClose: () => void }) {
  const [cur, setCur] = useState(index);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setCur(c => (c - 1 + images.length) % images.length);
      if (e.key === 'ArrowLeft') setCur(c => (c + 1) % images.length);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [images.length, onClose]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] bg-bg/95 flex items-center justify-center"
      onClick={onClose}>
      <button className="absolute top-5 right-5 text-fg/60 hover:text-fg" onClick={onClose}><X size={28} /></button>
      <button className="absolute right-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-fg/10 hover:bg-fg/20 flex items-center justify-center text-fg transition-all"
        onClick={e => { e.stopPropagation(); setCur(c => (c - 1 + images.length) % images.length); }}>
        <ChevronRight size={22} />
      </button>
      <img src={images[cur]} alt="" className="max-h-[85vh] max-w-[85vw] object-contain rounded-xl"
        onClick={e => e.stopPropagation()} />
      <button className="absolute left-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-fg/10 hover:bg-fg/20 flex items-center justify-center text-fg transition-all"
        onClick={e => { e.stopPropagation(); setCur(c => (c + 1) % images.length); }}>
        <ChevronLeft size={22} />
      </button>
      <div className="absolute bottom-5 flex gap-2">
        {images.map((_, i) => (
          <button key={i} onClick={e => { e.stopPropagation(); setCur(i); }}
            className={`w-2 h-2 rounded-full transition-all ${i === cur ? 'bg-white' : 'bg-white/30'}`} />
        ))}
      </div>
    </motion.div>
  );
}

// ─── Size Guide Modal ─────────────────────────────────────────────────────────

function SizeGuideModal({ onClose }: { onClose: () => void }) {
  const sizes = [
    { size: 'XS', chest: '۸۰-۸۴', length: '۶۴', shoulder: '۴۰' },
    { size: 'S',  chest: '۸۵-۸۹', length: '۶۶', shoulder: '۴۲' },
    { size: 'M',  chest: '۹۰-۹۴', length: '۶۸', shoulder: '۴۴' },
    { size: 'L',  chest: '۹۵-۹۹', length: '۷۰', shoulder: '۴۶' },
    { size: 'XL', chest: '۱۰۰-۱۰۴', length: '۷۲', shoulder: '۴۸' },
    { size: 'XXL', chest: '۱۰۵-۱۱۰', length: '۷۴', shoulder: '۵۰' },
  ];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[99] bg-bg/80 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}>
      <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        className="bg-surface border border-border rounded-3xl p-6 w-full max-w-md"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-fg font-bold text-lg">راهنمای سایز تی‌شرت</h3>
          <button onClick={onClose} className="text-muted hover:text-fg"><X size={20} /></button>
        </div>
        <p className="text-muted text-xs mb-4">اندازه‌ها بر حسب سانتی‌متر</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['سایز', 'دور سینه', 'طول', 'شانه'].map(h => (
                  <th key={h} className="text-muted font-medium py-2 text-center">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sizes.map((r, i) => (
                <tr key={r.size} className={`border-b border-border ${i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                  <td className="py-2.5 text-center font-bold text-primary">{r.size}</td>
                  <td className="py-2.5 text-center text-muted">{r.chest}</td>
                  <td className="py-2.5 text-center text-muted">{r.length}</td>
                  <td className="py-2.5 text-center text-muted">{r.shoulder}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-subtle text-xs mt-4">💡 اگه بین دو سایز هستی، سایز بزرگ‌تر رو انتخاب کن</p>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [activeImg, setActiveImg] = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const [selectedColor, setColor] = useState<string | null>(null);
  const [selectedSize, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);

  const [liked, setLiked] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addedOk, setAddedOk] = useState(false);
  const [tab, setTab] = useState<'desc' | 'specs' | 'care'>('desc');
  const [sizeGuideOpen, setSizeGuide] = useState(false);

  useEffect(() => {
    fetch(`/api/shop/products/${slug}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setProduct(d.data.product);
          setRelated(d.data.related);
          // Set defaults
          const variants: Variant[] = d.data.product.variants;
          if (variants.length > 0) {
            const firstColor = variants.find(v => v.stock > 0)?.color ?? variants[0].color;
            setColor(firstColor);
            const sizesForColor = variants.filter(v => v.color === firstColor && v.stock > 0);
            if (sizesForColor.length > 0) setSize(sizesForColor[0].size);
          }
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="min-h-dvh bg-bg flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (notFound || !product) return (
    <div className="min-h-dvh bg-bg flex flex-col items-center justify-center gap-4 text-fg">
      <p className="text-2xl font-bold">محصول پیدا نشد</p>
      <Link href="/products" className="text-primary hover:underline">بازگشت به فروشگاه</Link>
    </div>
  );

  // ── Derived data ──────────────────────────────────────────────────────────

  const allImgs = [fixImg(product.mainImage), ...product.images.map(fixImg)].filter(Boolean) as string[];

  const variants = product.variants;
  const uniqueColors = [...new Set(variants.map(v => v.color).filter(Boolean))] as string[];
  const sizesForColor = selectedColor
    ? variants.filter(v => v.color === selectedColor).sort((a, b) =>
        SIZE_ORDER.indexOf(a.size ?? '') - SIZE_ORDER.indexOf(b.size ?? ''))
    : [];
  const allSizes = [...new Set(variants.map(v => v.size).filter(Boolean))] as string[];
  const noVariants = variants.length === 0;

  const activeVariant = variants.find(v => v.color === selectedColor && v.size === selectedSize) ?? null;
  const effectivePrice = activeVariant?.price
    ? parseFloat(activeVariant.price)
    : parseFloat(product.price);
  const comparePrice = product.compareAtPrice ? parseFloat(product.compareAtPrice) : null;
  const discountPct = comparePrice && comparePrice > effectivePrice
    ? Math.round(((comparePrice - effectivePrice) / comparePrice) * 100) : 0;

  const stockForSelection = noVariants ? product.totalStock : (activeVariant?.stock ?? 0);
  const canBuy = noVariants
    ? product.totalStock > 0
    : (selectedSize !== null && (uniqueColors.length === 0 || selectedColor !== null) && (activeVariant?.stock ?? 0) > 0);

  // ── Add to cart ───────────────────────────────────────────────────────────

  const addToCart = async () => {
    const { toast } = await import('react-hot-toast');
    if (!noVariants && !selectedSize) {
      toast.error('لطفاً ابتدا سایز را انتخاب کنید');
      return;
    }
    if (!noVariants && uniqueColors.length > 0 && !selectedColor) {
      toast.error('لطفاً ابتدا رنگ را انتخاب کنید');
      return;
    }
    setAdding(true);
    try {
      const res = await fetch('/api/user/cart', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          variantId: activeVariant?.id ?? undefined,
          quantity: qty,
        }),
      });
      if (res.status === 401) {
        toast.error('برای خرید ابتدا وارد حساب کاربری شوید');
        setTimeout(() => { window.location.href = '/user/login'; }, 1500);
        return;
      }
      if (res.ok) {
        setAddedOk(true);
        setTimeout(() => setAddedOk(false), 2500);
        toast.success('به سبد خرید اضافه شد ✓');
      } else {
        toast.error('خطا در افزودن به سبد خرید');
      }
    } finally { setAdding(false); }
  };

  const toggleWishlist = async () => {
    const { toast } = await import('react-hot-toast');
    const res = await fetch('/api/user/wishlist', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product.id }),
    });
    if (res.status === 401) {
      toast.error('برای علاقه‌مندی ابتدا وارد حساب کاربری شوید');
      setTimeout(() => { window.location.href = '/user/login'; }, 1500);
      return;
    }
    if (res.ok) {
      const d = await res.json();
      setLiked(d.liked);
      toast.success(d.liked ? 'به علاقه‌مندی‌ها اضافه شد' : 'از علاقه‌مندی‌ها حذف شد');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-dvh bg-bg text-fg" dir="rtl">

      {/* nav */}
      <header className="sticky top-0 z-40 bg-bg/85 backdrop-blur-2xl border-b border-border">
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center gap-4">
          <Link href="/products" className="flex items-center gap-1.5 text-muted hover:text-fg transition-colors text-sm">
            <ChevronRight size={16} /> فروشگاه
          </Link>
          <span className="text-fg/10">/</span>
          <Link href={`/products?category=${product.category.name}`} className="text-muted hover:text-fg transition-colors text-sm">
            {product.category.name}
          </Link>
          <span className="text-fg/10">/</span>
          <span className="text-muted text-sm truncate">{product.name}</span>

          <div className="mr-auto flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/bluelogo.png" alt="کاویان" width={28} height={28} className="object-contain" />
              <span className="text-base font-black hidden sm:block">کاویان</span>
            </Link>
          </div>
        </div>
      </header>

      {/* main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">

          {/* ── Left: Images ── */}
          <div className="flex flex-col gap-4">
            {/* main image */}
            <div className="relative aspect-square bg-white rounded-3xl overflow-hidden group cursor-zoom-in"
              onClick={() => allImgs.length > 0 && setLightboxIdx(activeImg)}>
              {allImgs.length > 0 ? (
                <AnimatePresence mode="wait">
                  <motion.img key={activeImg} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    src={allImgs[activeImg]} alt={product.name}
                    className="w-full h-full object-contain p-4"
                  />
                </AnimatePresence>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted">
                  <ShoppingCart size={64} />
                </div>
              )}
              {allImgs.length > 1 && (
                <>
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-bg/40 hover:bg-bg/60 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                    onClick={e => { e.stopPropagation(); setActiveImg(i => (i - 1 + allImgs.length) % allImgs.length); }}>
                    <ChevronRight size={18} />
                  </button>
                  <button className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-bg/40 hover:bg-bg/60 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                    onClick={e => { e.stopPropagation(); setActiveImg(i => (i + 1) % allImgs.length); }}>
                    <ChevronLeft size={18} />
                  </button>
                </>
              )}
              {/* zoom hint */}
              <div className="absolute bottom-3 left-3 bg-bg/50 rounded-full px-2.5 py-1 text-[10px] text-fg/60 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn size={11} /> بزرگ‌نمایی
              </div>
              {/* badges */}
              {(discountPct > 0 || product.isNew) && (
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  {discountPct > 0 && (
                    <span className="px-3 py-1.5 bg-red-500 text-fg text-xs font-black rounded-full shadow-lg"
                      style={{ boxShadow: '0 0 16px rgba(239,68,68,0.5)' }}>
                      {discountPct}٪ تخفیف
                    </span>
                  )}
                  {product.isNew && (
                    <span className="px-3 py-1.5 bg-primary text-black text-xs font-black rounded-full"
                      style={{ boxShadow: '0 0 16px rgba(168,85,247,0.5)' }}>
                      جدید
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* thumbnails */}
            {allImgs.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-none">
                {allImgs.map((src, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl bg-white overflow-hidden border-2 transition-all ${
                      activeImg === i ? 'border-primary' : 'border-transparent opacity-50 hover:opacity-80'
                    }`}>
                    <img src={src} alt="" className="w-full h-full object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Info ── */}
          <div className="flex flex-col gap-6">

            {/* header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Link href={`/products?category=${product.category.name}`}
                  className="text-xs text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full hover:bg-primary/15 transition-colors">
                  {product.category.name}
                </Link>
                {product.gender && (
                  <span className="text-xs text-muted bg-fg/5 px-2.5 py-1 rounded-full">
                    {{ MEN: 'مردانه', WOMEN: 'زنانه', UNISEX: 'یونیسکس', KIDS: 'بچگانه' }[product.gender] ?? product.gender}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-fg leading-tight mb-1">{product.name}</h1>
              {product.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {product.tags.map(t => (
                    <span key={t} className="text-[10px] text-subtle bg-white/[0.03] border border-border px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
              )}
            </div>

            {/* price */}
            <div className="flex items-end gap-3">
              <span className="text-3xl font-black text-fg tabular-nums">{fmt(effectivePrice)}</span>
              <span className="text-muted mb-1">تومان</span>
              {comparePrice && comparePrice > effectivePrice && (
                <span className="text-subtle line-through text-lg tabular-nums mb-0.5">{fmt(comparePrice)}</span>
              )}
            </div>

            {/* stock indicator */}
            <div className="flex items-center gap-2">
              {stockForSelection > 0 ? (
                <>
                  <CheckCircle size={15} className="text-green-400 flex-shrink-0" />
                  <span className="text-sm text-green-400">
                    {stockForSelection <= 5 ? `فقط ${new Intl.NumberFormat('fa-IR').format(stockForSelection)} عدد باقی‌مانده` : 'موجود در انبار'}
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle size={15} className="text-red-400 flex-shrink-0" />
                  <span className="text-sm text-red-400">ناموجود</span>
                </>
              )}
            </div>

            {/* ── Color selector ── */}
            {uniqueColors.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-fg">رنگ</span>
                  {selectedColor && (
                    <span className="text-xs text-muted">
                      {COLOR_FA[selectedColor] ?? selectedColor}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {uniqueColors.map(color => {
                    const hasStock = variants.some(v => v.color === color && v.stock > 0);
                    const hex = COLOR_HEX[color] ?? color;
                    const active = selectedColor === color;
                    return (
                      <button key={color} onClick={() => {
                        setColor(color);
                        const first = variants.find(v => v.color === color && v.stock > 0);
                        setSize(first?.size ?? null);
                      }}
                        title={COLOR_FA[color] ?? color}
                        disabled={!hasStock}
                        className={`relative w-9 h-9 rounded-full transition-all ${
                          active ? 'ring-2 ring-offset-2 ring-offset-[#080808] ring-primary scale-110' : 'hover:scale-105'
                        } ${!hasStock ? 'opacity-30' : ''}`}
                        style={{ background: hex }}>
                        {active && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <CheckCircle size={14} className={color === 'white' ? 'text-black' : 'text-fg'} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Size selector ── */}
            {(() => {
              // Sizes to show: from variants > availableSizes field > default t-shirt sizes
              let displaySizes: { size: string; inStock: boolean }[] = [];
              if (sizesForColor.length > 0) {
                displaySizes = sizesForColor.map(v => ({ size: v.size!, inStock: v.stock > 0 }));
              } else if (allSizes.length > 0) {
                displaySizes = allSizes.map(s => ({ size: s, inStock: true }));
              } else if (product.availableSizes && product.availableSizes.length > 0) {
                displaySizes = [...product.availableSizes]
                  .sort((a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b))
                  .map(s => ({ size: s, inStock: true }));
              } else {
                // Fallback: standard t-shirt sizes always shown
                displaySizes = ['S','M','L','XL','XXL'].map(s => ({ size: s, inStock: true }));
              }
              return (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-fg">سایز</span>
                    <button onClick={() => setSizeGuide(true)}
                      className="flex items-center gap-1 text-xs text-primary hover:text-primary transition-colors">
                      <Ruler size={12} /> راهنمای سایز
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {displaySizes.map(({ size: sz, inStock }) => {
                      const active = selectedSize === sz;
                      return (
                        <button key={sz} onClick={() => inStock && setSize(sz === selectedSize ? null : sz)} disabled={!inStock}
                          className={`relative min-w-[48px] h-11 px-3 rounded-xl text-sm font-bold border transition-all ${
                            active
                              ? 'bg-primary border-primary text-black shadow-[0_0_16px_rgba(168,85,247,0.4)]'
                              : inStock
                                ? 'bg-white/[0.04] border-border text-muted hover:border-white/25 hover:text-fg'
                                : 'bg-white/[0.02] border-border text-fg/20 cursor-not-allowed'
                          }`}>
                          {SIZE_LABEL[sz] ?? sz}
                          {!inStock && (
                            <span className="absolute inset-0 flex items-center justify-center">
                              <span className="w-full h-px bg-white/15 rotate-45 absolute" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {noVariants && (
                    <p className="text-xs text-subtle mt-2">* سایز دقیق را هنگام ثبت سفارش مشخص می‌کنید</p>
                  )}
                </div>
              );
            })()}

            {/* ── Quantity ── */}
            <div>
              <span className="text-sm font-bold text-fg mb-3 block">تعداد</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-white/[0.04] border border-border rounded-xl overflow-hidden">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-11 h-11 flex items-center justify-center text-muted hover:text-fg hover:bg-fg/5 transition-all text-lg font-bold">
                    −
                  </button>
                  <span className="w-10 text-center font-bold text-fg tabular-nums">
                    {new Intl.NumberFormat('fa-IR').format(qty)}
                  </span>
                  <button onClick={() => setQty(q => Math.min(stockForSelection || 10, q + 1))}
                    className="w-11 h-11 flex items-center justify-center text-muted hover:text-fg hover:bg-fg/5 transition-all text-lg font-bold">
                    +
                  </button>
                </div>
                {stockForSelection > 0 && stockForSelection <= 10 && (
                  <span className="text-xs text-amber-400">
                    حداکثر {new Intl.NumberFormat('fa-IR').format(stockForSelection)} عدد
                  </span>
                )}
              </div>
            </div>

            {/* ── CTA buttons ── */}
            <div className="flex items-center gap-3">
              <motion.button onClick={addToCart} disabled={!canBuy || adding}
                whileTap={{ scale: 0.97 }}
                className="relative flex-1 h-14 rounded-2xl font-black text-base flex items-center justify-center gap-2.5 overflow-hidden transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: canBuy ? '#22ff88' : '#374151',
                  color: '#000',
                  boxShadow: canBuy ? '0 0 30px rgba(34,255,136,0.45)' : 'none',
                }}>
                {/* glare */}
                {canBuy && (
                  <span className="pointer-events-none absolute top-0 -left-full h-full w-1/3 skew-x-[-20deg] bg-fg/50 blur-md animate-[glare_2.5s_ease-in-out_infinite]" />
                )}
                {adding ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : addedOk ? (
                  <><CheckCircle size={20} /> به سبد اضافه شد</>
                ) : (
                  <><ShoppingCart size={20} /> افزودن به سبد خرید</>
                )}
              </motion.button>

              <button onClick={toggleWishlist}
                className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all active:scale-90 flex-shrink-0 ${
                  liked
                    ? 'bg-red-500/15 border-red-500/50 text-red-400'
                    : 'bg-white/[0.04] border-border text-muted hover:text-red-400 hover:border-red-500/40'
                }`}>
                <Heart size={22} className={liked ? 'fill-red-400' : ''} />
              </button>

              <button onClick={() => navigator.share?.({ title: product.name, url: window.location.href })
                  .catch(() => navigator.clipboard.writeText(window.location.href))}
                className="w-14 h-14 rounded-2xl border border-border bg-white/[0.04] text-muted hover:text-fg hover:border-white/20 flex items-center justify-center transition-all flex-shrink-0">
                <Share2 size={18} />
              </button>
            </div>

            {/* ── Trust badges ── */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              {[
                { icon: <Truck size={16} />, label: 'ارسال سریع' },
                { icon: <RotateCcw size={16} />, label: '۷ روز مرجوعی' },
                { icon: <Shield size={16} />, label: 'ضمانت اصالت' },
              ].map(b => (
                <div key={b.label}
                  className="flex flex-col items-center gap-1.5 py-3 bg-white/[0.03] border border-border rounded-xl">
                  <span className="text-primary">{b.icon}</span>
                  <span className="text-[10px] text-muted font-medium">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="mt-14 border-b border-border">
          <div className="flex gap-1">
            {([
              { key: 'desc', label: 'توضیحات' },
              { key: 'specs', label: 'مشخصات' },
              { key: 'care', label: 'راهنمای نگهداری' },
            ] as const).map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-5 py-3 text-sm font-bold transition-all border-b-2 -mb-px ${
                  tab === t.key
                    ? 'text-primary border-primary'
                    : 'text-muted border-transparent hover:text-muted'
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="py-8 max-w-2xl">
          <AnimatePresence mode="wait">
            {tab === 'desc' && (
              <motion.div key="desc" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {product.description ? (
                  <p className="text-muted leading-8 text-sm">{product.description}</p>
                ) : (
                  <p className="text-subtle text-sm">توضیحات برای این محصول ثبت نشده.</p>
                )}
              </motion.div>
            )}
            {tab === 'specs' && (
              <motion.div key="specs" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="space-y-1">
                  {[
                    ['نوع محصول', 'تی‌شرت'],
                    ['جنس', product.clothingAttributes?.fabricType ?? product.material ?? '—'],
                    ['برش', product.clothingAttributes?.fit ?? '—'],
                    ['آستین', product.clothingAttributes?.sleeveType ?? '—'],
                    ['یقه', product.clothingAttributes?.neckType ?? '—'],
                    ['طرح', product.clothingAttributes?.pattern ?? '—'],
                    ['کشور تولید', product.clothingAttributes?.origin ?? '—'],
                    ['وزن', product.weight ? `${product.weight} گرم` : '—'],
                    ['جنسیت', product.gender ? ({ MEN: 'مردانه', WOMEN: 'زنانه', UNISEX: 'یونیسکس', KIDS: 'بچگانه' }[product.gender] ?? product.gender) : '—'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between py-2.5 border-b border-border">
                      <span className="text-muted text-sm">{label}</span>
                      <span className="text-gray-200 text-sm font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
            {tab === 'care' && (
              <motion.div key="care" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {product.clothingAttributes?.care ? (
                  <p className="text-muted text-sm leading-8">{product.clothingAttributes.care}</p>
                ) : (
                  <ul className="space-y-3 text-sm text-muted">
                    {[
                      '🌡️ شستشو با آب ۳۰ درجه',
                      '🚫 استفاده از مواد سفیدکننده ممنوع',
                      '♻️ امکان شستشو در ماشین لباسشویی',
                      '🌿 خشک‌کردن در سایه — دور از نور مستقیم آفتاب',
                      '🔁 اتوکشی از پشت طرح با دمای کم',
                    ].map(item => (
                      <li key={item} className="flex items-start gap-2">{item}</li>
                    ))}
                  </ul>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Related products ── */}
        {related.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-black text-fg mb-6">محصولات مشابه</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {related.map(p => {
                const img = fixImg(p.mainImage ?? p.images?.[0]);
                return (
                  <Link key={p.id} href={`/products/${p.slug}`}
                    className="group bg-surface border border-border hover:border-primary/40 rounded-2xl overflow-hidden transition-all hover:shadow-[0_0_30px_rgba(124,58,237,0.12)]">
                    <div className="aspect-square bg-white overflow-hidden">
                      {img
                        ? <img src={img} alt={p.name} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                        : <div className="w-full h-full flex items-center justify-center text-muted"><ShoppingCart size={24} /></div>
                      }
                    </div>
                    <div className="p-3">
                      <p className="text-fg text-xs font-semibold line-clamp-2 mb-1">{p.name}</p>
                      <p className="text-muted text-xs tabular-nums">{fmt(p.price)} تومان</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIdx !== null && (
          <Lightbox images={allImgs} index={lightboxIdx} onClose={() => setLightboxIdx(null)} />
        )}
      </AnimatePresence>

      {/* Size Guide */}
      <AnimatePresence>
        {sizeGuideOpen && <SizeGuideModal onClose={() => setSizeGuide(false)} />}
      </AnimatePresence>

      <style>{`
        @keyframes glare {
          0% { left: -100%; }
          50% { left: 150%; }
          100% { left: 150%; }
        }
      `}</style>
    </div>
  );
}
