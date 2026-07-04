'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  Heart, ShoppingCart, Search,
  ChevronDown, X, Tag, ArrowUpDown, GridIcon, Rows3
} from 'lucide-react';
import SiteNavbar from '@/components/SiteNavbar';
import { ProductCard, SkeletonCard } from '@/components/ProductCard';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ProductItem {
  id: string;
  name: string;
  slug?: string;
  price: number;
  compareAtPrice?: number;
  mainImage?: string;
  images?: string[];
  isNew?: boolean;
  isFeatured?: boolean;
  totalStock?: number;
  category?: { id: string; name: string } | string;
}


// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number) => new Intl.NumberFormat('fa-IR').format(n);
const discountPct = (price: number, compare: number) => Math.round(((compare - price) / compare) * 100);

// Card and SkeletonCard are now imported from @/components/ProductCard

// ─── List Row ────────────────────────────────────────────────────────────────

function ListRow({ product }: { product: ProductItem }) {
  const [liked, setLiked] = useState(false);
  const img = fixImg(product.mainImage ?? product.images?.[0]);
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const pct = hasDiscount ? discountPct(product.price, product.compareAtPrice!) : 0;
  const outOfStock = product.totalStock === 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="group flex items-center gap-4 bg-surface border border-border hover:border-primary/40 rounded-2xl overflow-hidden transition-all duration-200 p-3"
    >
      {/* image */}
      <div className="w-20 h-20 rounded-xl overflow-hidden bg-white flex-shrink-0">
        {img
          ? <img src={img} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
          : <div className="w-full h-full flex items-center justify-center text-subtle"><ShoppingCart size={24} /></div>
        }
      </div>

      {/* info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-primary mb-0.5">
          {typeof product.category === 'object' ? product.category?.name : product.category}
        </p>
        <h3 className="text-fg text-sm font-semibold line-clamp-1 mb-1">{product.name}</h3>
        <div className="flex items-center gap-2">
          <span className="text-fg font-bold text-sm tabular-nums">{fmt(product.price)} تومان</span>
          {hasDiscount && (
            <>
              <span className="text-subtle text-xs line-through tabular-nums">{fmt(product.compareAtPrice!)}</span>
              <span className="text-[10px] bg-primary/15 text-primary border border-primary/25 px-1.5 py-0.5 rounded-full">{pct}٪</span>
            </>
          )}
        </div>
      </div>

      {/* actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button onClick={() => setLiked(l => !l)}
          className="w-9 h-9 rounded-xl border border-border hover:border-primary/40 flex items-center justify-center cursor-pointer transition-all">
          <Heart size={14} className={liked ? 'fill-red-400 text-red-400' : 'text-muted'} />
        </button>
        <button disabled={outOfStock}
          className={`px-4 h-9 rounded-xl text-sm font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
            outOfStock ? 'bg-fg/5 text-subtle cursor-not-allowed' : 'bg-primary text-black hover:scale-105 active:scale-95'
          }`}>
          <ShoppingCart size={13} />
          {outOfStock ? 'ناموجود' : 'افزودن'}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: 'newest',     label: 'جدیدترین' },
  { value: 'price-asc',  label: 'ارزان‌ترین' },
  { value: 'price-desc', label: 'گران‌ترین' },
];

interface CategoryItem {
  name: string;
  slug: string;
  color: string;   // neon accent
  bg: string;      // subtle bg tint
  icon: React.ReactNode;
}

function MusicIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
    </svg>
  );
}
function FilmIcon2({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
      <line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" />
      <line x1="2" y1="17" x2="7" y2="17" /><line x1="17" y1="17" x2="22" y2="17" />
      <line x1="17" y1="7" x2="22" y2="7" />
    </svg>
  );
}
function GameIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="12" x2="10" y2="12" /><line x1="8" y1="10" x2="8" y2="14" />
      <circle cx="15" cy="13" r="0.5" fill="currentColor" /><circle cx="17.5" cy="11" r="0.5" fill="currentColor" />
      <path d="M21 6H3a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2z" />
    </svg>
  );
}
function AnimeIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
function NostalgiaIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function MemeIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 13s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" strokeWidth={3} /><line x1="15" y1="9" x2="15.01" y2="9" strokeWidth={3} />
    </svg>
  );
}
function ComicIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}
function ArtIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
      <path d="M2 12s4-4 10-4 10 4 10 4-4 4-10 4-10-4-10-4z" fill="none" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function OtherIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
    </svg>
  );
}

const CATEGORIES: CategoryItem[] = [
  { name: 'موسیقی',       slug: 'music',       color: '#f472b6', bg: 'rgba(244,114,182,0.08)', icon: <MusicIcon /> },
  { name: 'فیلم و سریال', slug: 'film',        color: '#fb923c', bg: 'rgba(251,146,60,0.08)',  icon: <FilmIcon2 /> },
  { name: 'بازی',         slug: 'game',        color: '#22ff88', bg: 'rgba(34,255,136,0.08)',  icon: <GameIcon /> },
  { name: 'انیمه',        slug: 'anime',       color: '#facc15', bg: 'rgba(250,204,21,0.08)',  icon: <AnimeIcon /> },
  { name: 'نوستالژی',     slug: 'nostalgia',   color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', icon: <NostalgiaIcon /> },
  { name: 'میم و فان',    slug: 'meme',        color: '#a3e635', bg: 'rgba(163,230,53,0.08)', icon: <MemeIcon /> },
  { name: 'کامیک',        slug: 'comic',       color: '#f87171', bg: 'rgba(248,113,113,0.08)',icon: <ComicIcon /> },
  { name: 'تاریخ و هنر',  slug: 'art-history', color: '#c084fc', bg: 'rgba(192,132,252,0.08)',icon: <ArtIcon /> },
  { name: 'سایر',         slug: 'other',       color: '#94a3b8', bg: 'rgba(148,163,184,0.08)',icon: <OtherIcon /> },
];

function ProductsPageInner() {
  const searchParams = useSearchParams();
  const collectionParam = searchParams.get('collection');
  const isNewCollection = collectionParam === 'new';

  const [products, setProducts]     = useState<ProductItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [selectedCat, setCat]       = useState('');
  const [sort, setSort]             = useState('newest');
  const [view, setView]             = useState<'grid' | 'list'>('grid');
  const [sortOpen, setSortOpen]     = useState(false);
  const [page, setPage]             = useState(1);
  const [total, setTotal]           = useState(0);
  const sortRef = useRef<HTMLDivElement>(null);
  const LIMIT = 24;

  const fetchProducts = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(p), limit: String(LIMIT),
        ...(search && { search }),
        ...(selectedCat && { category: selectedCat }),
        ...(isNewCollection && { isNew: 'true' }),
      });
      const res = await fetch(`/api/shop/products?${params}`);
      const data = await res.json();
      if (data.success) {
        setProducts(p === 1 ? data.data : prev => [...prev, ...data.data]);
        setTotal(data.pagination?.total ?? 0);
        setPage(p);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [search, selectedCat, isNewCollection]);

  useEffect(() => { setProducts([]); fetchProducts(1); }, [search, selectedCat]);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const sorted = [...products].sort((a, b) => {
    if (sort === 'price-asc')  return a.price - b.price;
    if (sort === 'price-desc') return b.price - a.price;
    return 0;
  });

  return (
    <div className="min-h-dvh bg-bg text-fg" dir="rtl">

      <SiteNavbar />

      {/* ── page header with hero search ── */}
      <div className="relative overflow-hidden border-b border-border pt-16">
        {/* ambient neon glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(120% 90% at 50% 0%, rgba(168,85,247,0.16), transparent 60%)' }} />
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '34px 34px' }} />

        <div className="relative max-w-7xl mx-auto px-5 pt-10 pb-6 text-center">
          <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="text-3xl sm:text-5xl font-black text-fg mb-1.5">
            {isNewCollection ? (
              <>کالکشن <span style={{ color: '#22ff88', textShadow: '0 0 40px rgba(34,255,136,0.5)' }}>جدید</span></>
            ) : (
              <>طرحی که <span className="text-primary" style={{ textShadow: '0 0 40px rgba(168,85,247,0.5)' }}>داستان</span> داره</>
            )}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="text-muted text-sm mb-7">
            {isNewCollection ? 'جدیدترین محصولات کاویان — تازه رسیده' : 'از فیلم و موسیقی تا فرهنگ ایرانی — تنپوشت رو پیدا کن'}
          </motion.p>

          {/* big search */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
            className="relative max-w-xl mx-auto">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="جستجوی محصول... (مثلاً دون، پینک فلوید، کوروش)"
              className="w-full h-13 py-3.5 bg-surface border border-border text-fg placeholder-gray-600 text-sm rounded-2xl pr-12 pl-12 focus:outline-none focus:border-primary/60 focus:shadow-[0_0_30px_rgba(168,85,247,0.2)] transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} aria-label="پاک کردن"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted hover:text-fg transition-colors"><X size={16} /></button>
            )}
          </motion.div>
        </div>
      </div>

      {/* ── category cards section ── */}
      <div className="border-b border-border bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-none pb-1">
            {/* ALL pill */}
            <button onClick={() => setCat('')}
              className={`flex-shrink-0 flex flex-col items-center gap-2 w-[72px] group transition-all duration-200`}
              style={{ opacity: selectedCat !== '' ? 0.45 : 1 }}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 border ${
                selectedCat === ''
                  ? 'bg-primary/15 border-primary/50 shadow-[0_0_20px_rgba(168,85,247,0.4)] text-primary'
                  : 'bg-white/[0.04] border-border text-muted group-hover:border-white/20 group-hover:text-muted'
              }`}>
                <Tag size={18} />
              </div>
              <span className={`text-[10px] font-bold whitespace-nowrap ${selectedCat === '' ? 'text-primary' : 'text-muted group-hover:text-muted'}`}>همه</span>
            </button>

            {CATEGORIES.map(cat => {
              const active = selectedCat === cat.name;
              return (
                <button key={cat.slug} onClick={() => setCat(active ? '' : cat.name)}
                  className="flex-shrink-0 flex flex-col items-center gap-2 w-[72px] group transition-all duration-200"
                  style={{ opacity: selectedCat && !active ? 0.45 : 1 }}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 border"
                    style={{
                      background: active ? cat.bg : 'rgba(255,255,255,0.04)',
                      borderColor: active ? cat.color + '80' : 'rgba(255,255,255,0.08)',
                      color: active ? cat.color : '#6b7280',
                      boxShadow: active ? `0 0 20px ${cat.color}40` : 'none',
                    }}
                  >
                    {cat.icon}
                  </div>
                  <span className="text-[10px] font-bold whitespace-nowrap transition-colors"
                    style={{ color: active ? cat.color : '#6b7280' }}>
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── sticky toolbar: sort + view ── */}
      <div className="sticky top-16 z-30 bg-bg/85 backdrop-blur-2xl border-b border-border">
        <div className="max-w-7xl mx-auto px-5 py-3 flex items-center justify-between gap-3">
          {/* active filter label */}
          <div className="flex items-center gap-2">
            {selectedCat ? (
              <button onClick={() => setCat('')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all"
                style={{
                  background: CATEGORIES.find(c=>c.name===selectedCat)?.bg,
                  borderColor: (CATEGORIES.find(c=>c.name===selectedCat)?.color ?? '#a855f7') + '60',
                  color: CATEGORIES.find(c=>c.name===selectedCat)?.color ?? '#a855f7',
                }}>
                <span>{selectedCat}</span>
                <X size={11} />
              </button>
            ) : (
              <span className="text-xs text-subtle">همه محصولات</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* sort */}
            <div className="relative" ref={sortRef}>
              <button onClick={() => setSortOpen(s => !s)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-fg/5 rounded-full hover:bg-fg/10 transition-all text-muted">
                <ArrowUpDown size={13} className="text-muted" />
                <span className="hidden sm:inline">{SORT_OPTIONS.find(o => o.value === sort)?.label}</span>
                <ChevronDown size={12} className={`text-muted transition-transform duration-150 ${sortOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {sortOpen && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}
                    className="absolute left-0 top-full mt-2 bg-surface border border-border rounded-xl shadow-2xl min-w-[150px] z-50 overflow-hidden">
                    {SORT_OPTIONS.map(o => (
                      <button key={o.value} onClick={() => { setSort(o.value); setSortOpen(false); }}
                        className={`w-full text-right px-4 py-2.5 text-sm hover:bg-fg/5 transition-colors ${sort === o.value ? 'text-primary font-bold' : 'text-muted'}`}>
                        {o.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* view toggle */}
            <div className="hidden sm:flex bg-fg/5 rounded-full p-1 gap-1">
              {(['grid', 'list'] as const).map(v => (
                <button key={v} onClick={() => setView(v)} aria-label={v === 'grid' ? 'نمای شبکه' : 'نمای لیست'}
                  className={`p-1.5 rounded-full transition-all ${view === v ? 'bg-primary text-black' : 'text-muted hover:text-muted'}`}>
                  {v === 'grid' ? <GridIcon size={15} /> : <Rows3 size={15} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {!loading && (
          <p className="text-subtle text-sm mb-5">
            {total > 0 ? <><span className="text-muted tabular-nums">{new Intl.NumberFormat('fa-IR').format(total)}</span> محصول</> : 'محصولی یافت نشد'}
          </p>
        )}

        {/* grid */}
        {view === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {loading && products.length === 0
              ? Array(10).fill(0).map((_, i) => <SkeletonCard key={i} />)
              : sorted.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)
            }
            {loading && products.length > 0 && Array(5).fill(0).map((_, i) => <SkeletonCard key={`m${i}`} />)}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {loading && products.length === 0
              ? Array(6).fill(0).map((_, i) => <div key={i} className="h-28 bg-surface rounded-2xl animate-pulse border border-border" />)
              : sorted.map(p => <ListRow key={p.id} product={p} />)
            }
          </div>
        )}

        {/* empty state */}
        {!loading && products.length === 0 && (
          <div className="py-24 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-surface border border-border flex items-center justify-center mb-5">
              <ShoppingCart size={32} className="text-subtle" />
            </div>
            <p className="text-muted font-semibold text-lg mb-2">محصولی پیدا نشد</p>
            <p className="text-subtle text-sm mb-6 max-w-xs">
              {search ? `نتیجه‌ای برای «${search}» یافت نشد` : 'در این دسته‌بندی محصولی وجود ندارد'}
            </p>
            {(search || selectedCat) && (
              <button onClick={() => { setSearch(''); setCat(''); }}
                className="px-6 py-2.5 bg-primary hover:scale-105 active:scale-95 text-black font-bold text-sm rounded-full transition-all">
                پاک کردن فیلترها
              </button>
            )}
          </div>
        )}

        {/* load more */}
        {products.length < total && !loading && (
          <div className="mt-12 flex justify-center">
            <button onClick={() => fetchProducts(page + 1)}
              className="px-9 py-3.5 border border-primary/30 hover:border-primary/50 text-primary hover:bg-primary/15 text-sm font-bold rounded-full transition-all">
              نمایش بیشتر
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsPageInner />
    </Suspense>
  );
}
