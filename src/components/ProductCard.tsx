'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart } from 'lucide-react';

export interface ProductCardData {
  id: string;
  name: string;
  slug?: string;
  price: number;
  compareAtPrice?: number;
  mainImage?: string;
  images?: string[];
  isNew?: boolean;
  totalStock?: number;
}

function fixImg(p?: string) {
  if (!p) return undefined;
  if (p.startsWith('/api/')) return p;
  if (p.startsWith('/uploads/')) return '/api' + p;
  if (p.startsWith('uploads/')) return '/api/' + p;
  if (p.startsWith('api/')) return '/' + p;
  return p;
}

const fmt = (n: number) => new Intl.NumberFormat('fa-IR').format(n);
const discountPct = (price: number, compare: number) => Math.round(((compare - price) / compare) * 100);

export function ProductCard({ product, index = 0 }: { product: ProductCardData; index?: number }) {
  const [liked, setLiked] = useState(false);
  const [adding, setAdding] = useState(false);

  const img = fixImg(product.mainImage ?? product.images?.[0]);
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const pct = hasDiscount ? discountPct(product.price, product.compareAtPrice!) : 0;
  const outOfStock = product.totalStock === 0;
  const href = `/products/${product.slug ?? product.id}`;

  const addToCart = () => { window.location.href = href; };

  const toggleWishlist = async () => {
    const res = await fetch('/api/user/wishlist', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product.id }),
    });
    if (res.status === 401) { window.location.href = '/user/login'; return; }
    if (res.ok) {
      const d = await res.json();
      setLiked(d.liked);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.06 }}
      className="group relative bg-surface rounded-2xl overflow-hidden border border-border hover:border-primary/40 transition-all duration-300 hover:shadow-[0_0_40px_rgba(168,85,247,0.12)] flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-white flex-shrink-0">
        {img ? (
          <img src={img} alt={product.name} loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-2 to-surface-3">
            <ShoppingCart size={40} className="text-subtle" />
          </div>
        )}

        {/* Flag pennant badge */}
        {(hasDiscount || product.isNew) && (
          <div className="absolute top-0 right-4 flex flex-col items-center">
            <span
              className="px-2.5 pt-1.5 pb-3 text-fg text-[10px] font-black shadow-lg"
              style={{
                background: hasDiscount ? '#ef4444' : 'var(--primary)',
                clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 78%, 0 100%)',
                boxShadow: `0 4px 14px ${hasDiscount ? 'rgba(239,68,68,0.5)' : 'rgba(168,85,247,0.5)'}`,
              }}
            >
              {hasDiscount ? `${pct}٪ تخفیف` : 'جدید'}
            </span>
          </div>
        )}

        {/* Out of stock overlay */}
        {outOfStock && (
          <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
            <span className="text-xs text-fg/80 bg-bg/60 border border-border px-3 py-1.5 rounded-full">ناموجود</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <Link href={href}>
          <h3 className="text-fg font-semibold text-sm line-clamp-1 mb-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="mb-3">
          <span className="text-fg font-bold text-base tabular-nums">{fmt(product.price)}</span>
          <span className="text-muted text-xs mr-1">تومان</span>
          {hasDiscount && (
            <span className="text-subtle text-xs line-through tabular-nums mr-2">{fmt(product.compareAtPrice!)}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-auto">
          <button onClick={addToCart} disabled={outOfStock || adding}
            className="group/buy relative flex-1 h-10 flex items-center justify-center gap-2 rounded-xl text-sm font-black text-black overflow-hidden transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: outOfStock ? '#374151' : '#22ff88',
              boxShadow: outOfStock ? 'none' : '0 0 18px rgba(34,255,136,0.55)',
            }}>
            {!outOfStock && (
              <span className="pointer-events-none absolute top-0 -left-full h-full w-1/2 skew-x-[-20deg] bg-fg/40 blur-md group-hover/buy:left-[150%] transition-all duration-700 ease-out" />
            )}
            {adding
              ? <div className="w-3.5 h-3.5 border-2 border-black/40 border-t-black rounded-full animate-spin" />
              : <ShoppingCart size={15} />}
            {outOfStock ? 'ناموجود' : 'خرید'}
          </button>

          <button onClick={toggleWishlist} aria-label="افزودن به علاقه‌مندی"
            className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl border transition-all active:scale-90 ${
              liked
                ? 'bg-red-500/15 border-red-500/50 text-red-400'
                : 'bg-white/[0.04] border-border text-muted hover:text-red-400 hover:border-red-500/40'
            }`}>
            <Heart size={16} className={liked ? 'fill-red-400' : ''} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-surface border border-border animate-pulse">
      <div className="aspect-[3/4] bg-fg/5" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-fg/5 rounded w-4/5" />
        <div className="h-5 bg-fg/5 rounded w-2/3" />
        <div className="h-10 bg-fg/5 rounded" />
      </div>
    </div>
  );
}
