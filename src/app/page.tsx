'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useReducedMotion, useInView } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingCartIcon, HeartIcon, UserIcon, MagnifyingGlassIcon,
  Bars3Icon, XMarkIcon, ArrowRightIcon, SparklesIcon, FireIcon,
  StarIcon, BoltIcon, GlobeAltIcon,
} from '@heroicons/react/24/outline';
import ThemeToggle from '@/components/ThemeToggle';
import { useTheme } from 'next-themes';
import SiteNavbar from '@/components/SiteNavbar';
import { ProductCard, SkeletonCard } from '@/components/ProductCard';

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface Product {
  id: string; name: string; price: number; compareAtPrice?: number;
  mainImage?: string; totalStock: number;
}

// ─── IMAGE HELPER ─────────────────────────────────────────────────────────────
// Converts /uploads/... paths to /api/uploads/...
function img(p: string) {
  if (!p) return '';
  if (p.startsWith('/api/')) return p;
  if (p.startsWith('/uploads/')) return '/api' + p;
  if (p.startsWith('uploads/')) return '/api/' + p;
  if (p.startsWith('api/')) return '/' + p;
  return p;
}

// ─── HERO SLIDE TYPE ──────────────────────────────────────────────────────────
interface HeroSlide {
  id: string;
  imageUrl: string;
  tag: string;
  title: string;
  titleAccent: string;
  body: string;
  neon: string;
  neonInk: string;
  order: number;
}

// Fixed particle config (no Math.random() to avoid SSR hydration mismatch)
const PARTICLES = [
  { size: 4, x: 72, y: 15, opacity: 0.12, blur: 3, dy: -28, dx: 8,  dur: 5.5, delay: 0 },
  { size: 6, x: 85, y: 35, opacity: 0.08, blur: 5, dy: -22, dx: -10, dur: 7.2, delay: 1 },
  { size: 3, x: 65, y: 60, opacity: 0.14, blur: 2, dy: -18, dx: 12, dur: 4.8, delay: 2 },
  { size: 5, x: 90, y: 75, opacity: 0.09, blur: 4, dy: -32, dx: -6,  dur: 6.3, delay: 0.5 },
  { size: 4, x: 55, y: 25, opacity: 0.11, blur: 3, dy: -25, dx: 15,  dur: 5.0, delay: 1.8 },
  { size: 7, x: 78, y: 50, opacity: 0.06, blur: 6, dy: -20, dx: -8,  dur: 8.1, delay: 3 },
  { size: 3, x: 60, y: 80, opacity: 0.13, blur: 2, dy: -30, dx: 5,   dur: 4.5, delay: 2.5 },
  { size: 5, x: 95, y: 20, opacity: 0.08, blur: 4, dy: -24, dx: -12, dur: 6.7, delay: 0.8 },
];

const CATEGORIES = [
  { id: 'all',     label: 'همه',          neon: '#a855f7' },
  { id: 'movie',   label: 'فیلم و سریال', neon: '#f43f5e' },
  { id: 'game',    label: 'بازی',         neon: '#22d3ee' },
  { id: 'music',   label: 'موسیقی',       neon: '#fbbf24' },
  { id: 'culture', label: 'فرهنگ ایرانی', neon: '#34d399' },
];

const CAT_KW: Record<string, string[]> = {
  movie:   ['دون','ارباب','فیلم','سریال','لرد','ماتریکس','جنگ','godfather','dune','ring','lotr','lord','offer','spiderman'],
  game:    ['بازی','game','سایبرپانک','cyberpunk','gamer'],
  music:   ['موسیقی','پینک فلوید','pink','floyd','music','band','دیب','dib'],
  culture: ['ایرانی','ایران','کوروش','جمشید','مزدا','cyrus','persian','mazda','palace','king','throne'],
};

const fmt = (n: number) => new Intl.NumberFormat('fa-IR').format(n);

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function Navbar({ cartCount }: { cartCount: number }) {
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authed, setAuthed]   = useState<boolean | null>(null); // null = loading

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    fetch('/api/user/auth/me', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setAuthed(!!d.authenticated))
      .catch(() => setAuthed(false));
  }, []);

  const iconBtn = (active: boolean) =>
    active
      ? 'relative flex w-10 h-10 items-center justify-center rounded-full hover:bg-primary/15 text-muted hover:text-primary transition-all cursor-pointer'
      : 'relative flex w-10 h-10 items-center justify-center rounded-full text-fg/20 cursor-not-allowed opacity-40 select-none';

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-bg/85 backdrop-blur-2xl border-b border-border shadow-[0_1px_30px_rgba(0,0,0,0.8)]' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between" dir="rtl">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/bluelogo.png" alt="کاویان" width={34} height={34} className="object-contain" priority />
          <div className="flex flex-col leading-none">
            <span className="text-lg font-black tracking-tight text-fg">کاویان</span>
            <span className="text-[9px] text-primary font-medium mt-0.5">تنپوش‌های راوی</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-muted">
          {[['فروشگاه','/products'],['فیلم و سریال','/products'],['موسیقی','/products'],['بازی','/products'],['فرهنگ ایرانی','/products']].map(([l,h]) => (
            <Link key={l} href={h} className="hover:text-fg transition-colors relative group">
              {l}
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-primary group-hover:w-full transition-all duration-300" />
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {/* Auth buttons — only when not logged in */}
          {authed === false && (
            <div className="hidden md:flex items-center gap-2.5">
              <Link href="/user/login"
                className="relative px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 cursor-pointer overflow-hidden group"
                style={{ borderColor: 'var(--primary)', color: 'var(--primary)', boxShadow: '0 0 12px color-mix(in srgb,var(--primary) 30%,transparent)' }}>
                <span className="relative z-10">ورود</span>
                <span className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
              </Link>
              <Link href="/user/login"
                className="relative px-5 py-2.5 rounded-xl text-sm font-bold cursor-pointer overflow-hidden group transition-all duration-200"
                style={{ background: 'var(--primary)', color: 'var(--primary-fg)', boxShadow: '0 0 18px color-mix(in srgb,var(--primary) 60%,transparent), 0 0 36px color-mix(in srgb,var(--primary) 22%,transparent)' }}>
                <span className="relative z-10">ثبت نام</span>
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.18) 60%,transparent 80%)' }} />
              </Link>
            </div>
          )}

          {/* Profile — only when logged in */}
          {authed && (
            <Link href="/user/panel" className="hidden md:flex w-10 h-10 items-center justify-center rounded-full hover:bg-primary/15 text-muted hover:text-primary transition-all cursor-pointer">
              <UserIcon className="w-5 h-5" />
            </Link>
          )}

          {/* Cart — only when logged in */}
          {authed && (
            <Link href="/cart" className="relative flex w-10 h-10 items-center justify-center rounded-full hover:bg-primary/15 text-primary transition-all cursor-pointer">
              <ShoppingCartIcon className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-fg text-[10px] flex items-center justify-center font-bold leading-none tabular-nums">{cartCount}</span>
              )}
            </Link>
          )}

          {/* Hamburger */}
          <button onClick={() => setOpen(o => !o)} className="md:hidden w-10 h-10 flex items-center justify-center text-muted hover:text-fg cursor-pointer">
            {open ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden bg-bg/95 backdrop-blur-2xl border-b border-border" dir="rtl">
            <div className="px-5 py-4 space-y-1">
              {[['فروشگاه','/products'],['پنل کاربری','/user/panel'],['سبد خرید','/cart']].map(([l,h]) => (
                <Link key={l} href={h} onClick={() => setOpen(false)}
                  className="flex items-center gap-2 py-3 text-muted hover:text-fg border-b border-border last:border-0 transition-colors">
                  {l}
                </Link>
              ))}
              {authed === false && (
                <div className="flex gap-3 pt-3">
                  <Link href="/user/login" onClick={() => setOpen(false)}
                    className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold border cursor-pointer"
                    style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                    ورود
                  </Link>
                  <Link href="/user/login" onClick={() => setOpen(false)}
                    className="flex-1 text-center py-2.5 rounded-xl text-sm font-bold cursor-pointer"
                    style={{ background: 'var(--primary)', color: 'var(--primary-fg)', boxShadow: '0 0 14px color-mix(in srgb,var(--primary) 50%,transparent)' }}>
                    ثبت نام
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ─── HERO SECTION ─────────────────────────────────────────────────────────────
function HeroSection() {
  const [slides, setSlides]   = useState<HeroSlide[]>([]);
  const [idx, setIdx]         = useState(0);
  const ref                   = useRef<HTMLElement>(null);
  const reduce                = useReducedMotion();
  const { resolvedTheme }     = useTheme();

  useEffect(() => {
    fetch('/api/admin/hero-slides')
      .then(r => r.json())
      .then(d => { if (d.success && Array.isArray(d.data) && d.data.length > 0) setSlides(d.data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setIdx(i => (i + 1) % slides.length), 6500);
    return () => clearInterval(t);
  }, [slides.length]);

  const slide = slides[idx];

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const contentY  = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -55]);
  const contentOp = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const modelY    = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 80]);

  if (!slide) {
    return (
      <section className="relative min-h-dvh overflow-hidden bg-bg flex items-center justify-center">
        <div className="w-48 h-1.5 rounded-full bg-surface-2 overflow-hidden">
          <motion.div className="h-full bg-primary" animate={{ x: ['-100%', '200%'] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }} />
        </div>
      </section>
    );
  }

  const ink = resolvedTheme === 'light' ? slide.neonInk : slide.neon;

  return (
    <section ref={ref} className="relative min-h-dvh overflow-hidden bg-bg text-fg select-none" dir="rtl">

      {/* AMBIENT BACKGROUND — morphs with neon color */}
      <AnimatePresence>
        <motion.div
          key={`bg-${slide.id}`}
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.8, ease: 'easeInOut' }}
          style={{ background: `radial-gradient(140% 90% at 62% -5%, ${slide.neon}22 0%, ${slide.neon}08 30%, transparent 60%)` }}
        />
      </AnimatePresence>

      {/* DOT GRID */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.045]"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, var(--fg) 1px, transparent 0)', backgroundSize: '38px 38px' }} />

      {/* FLOATING NEON PARTICLES */}
      {!reduce && PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%`, background: slide.neon, opacity: p.opacity, filter: `blur(${p.blur}px)` }}
          animate={{ y: [0, p.dy, 0], x: [0, p.dx, 0], opacity: [p.opacity, p.opacity * 2, p.opacity] }}
          transition={{ duration: p.dur, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
        />
      ))}

      {/* MAIN GRID */}
      <div className="relative z-10 max-w-7xl mx-auto min-h-dvh grid md:grid-cols-[1fr_44%] items-center gap-0">

        {/* ── TEXT BLOCK ── */}
        <motion.div
          style={{ y: contentY, opacity: contentOp }}
          className="px-6 pt-28 pb-10 md:py-0 order-2 md:order-1"
        >
          <AnimatePresence mode="wait">
            <motion.div key={`text-${slide.id}`} className="flex flex-col items-start">

              {/* TAG */}
              <motion.div
                initial={{ opacity: 0, y: 14, scale: 0.88, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold mb-5 border backdrop-blur-sm"
                style={{ color: ink, borderColor: `${ink}55`, background: `${slide.neon}12`, boxShadow: `0 0 14px ${slide.neon}20` }}
              >
                <SparklesIcon className="w-3 h-3" />
                {slide.tag}
              </motion.div>

              {/* TITLE LINE 1 */}
              <motion.h1
                initial={{ opacity: 0, y: 48, filter: 'blur(12px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -22, filter: 'blur(8px)' }}
                transition={{ duration: 0.72, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
                className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.04] text-fg"
              >
                {slide.title}
              </motion.h1>

              {/* TITLE LINE 2 — neon colored */}
              <motion.h1
                initial={{ opacity: 0, y: 48, filter: 'blur(12px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -22, filter: 'blur(8px)' }}
                transition={{ duration: 0.72, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
                className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.04] mb-6"
                style={{
                  color: ink,
                  textShadow: resolvedTheme !== 'light'
                    ? `0 0 50px ${slide.neon}55, 0 0 100px ${slide.neon}22`
                    : 'none',
                }}
              >
                {slide.titleAccent}
              </motion.h1>

              {/* BODY */}
              <motion.p
                initial={{ opacity: 0, y: 28, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.65, delay: 0.26, ease: [0.16, 1, 0.3, 1] }}
                className="text-muted text-sm sm:text-base mb-9 max-w-md leading-relaxed"
              >
                {slide.body}
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55, delay: 0.36 }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto"
              >
                <Link href="/products"
                  className="flex items-center justify-center gap-2.5 px-8 h-12 rounded-full text-sm font-black text-black transition-all hover:scale-[1.05] active:scale-95"
                  style={{ background: slide.neon, boxShadow: `0 0 28px ${slide.neon}65, 0 0 55px ${slide.neon}28` }}>
                  کشف کن <ArrowRightIcon className="w-4 h-4" />
                </Link>
                <Link href="/products"
                  className="flex items-center justify-center gap-2 px-8 h-12 rounded-full text-sm font-bold text-fg border border-border hover:bg-fg/10 active:scale-95 transition-all backdrop-blur-sm">
                  همه محصولات
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* SLIDE DOTS */}
          <div className="flex items-center gap-4 mt-10">
            <div className="flex gap-2 items-center">
              {slides.map((s, i) => (
                <motion.button
                  key={s.id}
                  onClick={() => setIdx(i)}
                  aria-label={`اسلاید ${i + 1}`}
                  animate={{ width: i === idx ? 32 : 8, background: i === idx ? ink : 'rgba(255,255,255,0.18)' }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-full h-2"
                  style={{ boxShadow: i === idx ? `0 0 10px ${slide.neon}90` : 'none' }}
                />
              ))}
            </div>
            <span className="text-subtle text-xs font-mono" dir="ltr">
              {String(idx + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
            </span>
          </div>
        </motion.div>

        {/* ── MODEL IMAGE ── */}
        <motion.div
          style={{ y: modelY }}
          className="relative h-[60vw] md:h-dvh order-1 md:order-2 overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {slide.imageUrl ? (
              <motion.div
                key={`img-${slide.id}`}
                className="absolute inset-0"
                initial={{ clipPath: 'inset(0 0 100% 0)', opacity: 0.6 }}
                animate={{ clipPath: 'inset(0 0 0% 0)', opacity: 1 }}
                exit={{ clipPath: 'inset(100% 0 0 0)', opacity: 0 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Ken Burns zoom */}
                <motion.img
                  src={slide.imageUrl}
                  alt="مدل کاویان"
                  loading="eager"
                  initial={{ scale: 1.08 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 7.5, ease: 'easeOut' }}
                  className="w-full h-full object-cover object-top"
                  style={{
                    maskImage:
                      'linear-gradient(to right, transparent 0%, black 18%, black 90%, transparent 100%), ' +
                      'linear-gradient(to bottom, black 60%, transparent 100%)',
                    maskComposite: 'intersect',
                    WebkitMaskImage:
                      'linear-gradient(to right, transparent 0%, black 18%, black 90%, transparent 100%), ' +
                      'linear-gradient(to bottom, black 60%, transparent 100%)',
                    WebkitMaskComposite: 'source-in',
                  }}
                />
              </motion.div>
            ) : (
              // No image yet — gradient placeholder
              <motion.div
                key={`placeholder-${slide.id}`}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ background: `radial-gradient(ellipse 70% 80% at 50% 50%, ${slide.neon}28, transparent 70%)` }}
              />
            )}
          </AnimatePresence>

          {/* Neon ambient edge bleed */}
          <AnimatePresence>
            <motion.div
              key={`glow-${slide.id}`}
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 1.6 }}
              style={{ background: `linear-gradient(to right, ${slide.neon}0e 0%, transparent 45%)` }}
            />
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

// ─── NEON TICKER ──────────────────────────────────────────────────────────────
function NeonTicker() {
  const items = ['فیلم و سریال ✦', 'ارباب حلقه‌ها ✦', 'دون ✦', 'پینک فلوید ✦', 'سایبرپانک ✦', 'فرهنگ ایرانی ✦', 'بازی ✦', 'موسیقی ✦', 'کوروش بزرگ ✦'];
  return (
    <div className="overflow-hidden border-y border-primary/20 bg-surface py-3.5">
      <motion.div animate={{ x: ['0%', '-50%'] }} transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        className="flex gap-10 whitespace-nowrap">
        {[...items, ...items].map((t, i) => (
          <span key={i} className="text-primary/60 text-xs font-bold uppercase tracking-[0.2em]">{t}</span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── FEATURE STRIP ────────────────────────────────────────────────────────────
function FeatureStrip() {
  const items = [
    { icon: FireIcon,    label: 'طرح‌های اختصاصی',      sub: 'فقط اینجا پیدا میشن' },
    { icon: BoltIcon,    label: 'ارسال سریع',            sub: 'به سراسر ایران' },
    { icon: StarIcon,    label: 'پارچه با کیفیت',        sub: 'پنبه ۱۰۰٪ طبیعی' },
    { icon: GlobeAltIcon,label: 'الهام از فرهنگ جهانی', sub: 'برای ایرانی‌های امروز' },
  ];
  return (
    <div className="max-w-7xl mx-auto px-5 py-14" dir="rtl">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {items.map((it, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.08 }}
            className="bg-surface border border-border rounded-2xl px-5 py-5 flex flex-col gap-2 hover:border-primary/40 transition-all">
            <it.icon className="w-5 h-5 text-primary" />
            <p className="text-fg text-sm font-bold">{it.label}</p>
            <p className="text-muted text-xs">{it.sub}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ProductCard is now the shared component from @/components/ProductCard

// ─── COLLECTION SPOTLIGHT ────────────────────────────────────────────────────
const COLLECTION_NEONS = ['#a855f7','#fbbf24','#f43f5e','#34d399','#22d3ee','#fb923c'];

function CollectionSpotlight() {
  const [collections, setCollections] = useState<{ id: string; name: string; slug: string; image?: string; products: { mainImage?: string }[] }[]>([]);

  useEffect(() => {
    fetch('/api/collections').then(r => r.json()).then(d => { if (Array.isArray(d)) setCollections(d); }).catch(() => {});
  }, []);

  if (collections.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-5 py-16" dir="rtl">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">کالکشن‌ها</p>
          <h2 className="text-2xl sm:text-3xl font-black text-fg">دنیاهایی که دوستشون داری</h2>
        </div>
        <Link href="/products" className="text-sm text-muted hover:text-primary flex items-center gap-1 transition-colors">
          همه <ArrowRightIcon className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {collections.map((c, i) => {
          const neon = COLLECTION_NEONS[i % COLLECTION_NEONS.length];
          const coverImg = c.image || (c.products[0] as any)?.mainImage;
          return (
            <motion.div key={c.id} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
              <Link href={`/products?collection=${c.slug}`}
                className="group relative block rounded-2xl overflow-hidden aspect-[3/4] bg-surface-2 ring-1 ring-white/10 hover:ring-2 transition-all duration-300">
                {coverImg
                  ? <img src={img(coverImg)} alt={c.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  : <div className="w-full h-full" style={{ background: `radial-gradient(circle at 40% 40%, ${neon}30, transparent 70%)` }} />
                }
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent pt-10">
                  <p className="text-white font-bold text-sm">{c.name}</p>
                  <p className="text-xs font-medium mt-0.5" style={{ color: neon }}>{c.products.length} محصول</p>
                </div>
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ boxShadow: `inset 0 0 40px ${neon}40` }} />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

// ─── BRAND STORY ──────────────────────────────────────────────────────────────
function BrandStory() {
  return (
    <section className="max-w-7xl mx-auto px-5 py-16" dir="rtl">
      <div className="relative rounded-3xl overflow-hidden bg-bg border border-border">
        {/* BG pattern */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #a855f7 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl opacity-10" style={{ background: '#a855f7' }} />

        <div className="relative grid md:grid-cols-2 gap-8 items-center p-8 md:p-12">
          {/* Images collage */}
          <div className="grid grid-cols-2 gap-3 h-72 md:h-96 order-2 md:order-1">
            <img src="/api/uploads/images/FINAL PRODUCTS/Movieandseries/The Lord of the Rings/TheGreyWizard01.png"
              alt="Gandalf" loading="lazy" className="w-full h-full object-cover rounded-2xl bg-white ring-1 ring-white/10" />
            <div className="flex flex-col gap-3 min-h-0">
              <img src="/api/uploads/images/FINAL PRODUCTS/Movieandseries/DUNE/a-lone-Fremen-warrior01.png"
                alt="Fremen" loading="lazy" className="flex-1 min-h-0 w-full object-cover rounded-2xl bg-white ring-1 ring-white/10" />
              <img src="/api/uploads/images/FINAL PRODUCTS/Cyrus-The-Good.png"
                alt="Cyrus" loading="lazy" className="flex-1 min-h-0 w-full object-cover rounded-2xl bg-white ring-1 ring-white/10" />
            </div>
          </div>

          {/* Text */}
          <div className="order-1 md:order-2">
            <div className="flex items-center gap-2 text-xs font-bold text-primary mb-4 uppercase tracking-widest">
              <Image src="/bluelogo.png" alt="Cavian" width={20} height={20} className="opacity-80" />
              داستان ما
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-fg leading-tight mb-5">
              تیشرت فقط پارچه نیست —<br />
              <span style={{ color: '#a855f7', textShadow: '0 0 30px #a855f760' }}>یه حرف داره</span>
            </h2>
            <p className="text-muted leading-relaxed mb-4 text-sm">
              Cavian برای کسیه که می‌خواد داستانش رو با خودش حمل کنه. از ارباب حلقه‌ها تا دون، از پینک فلوید تا کوروش — هر طرح یه جهان‌بینیه، نه فقط یه لوگو.
            </p>
            <p className="text-subtle text-sm leading-relaxed mb-8">
              ما برای فن‌های واقعی می‌دوزیم. برای کسایی که وقتی لباس می‌پوشن، یه چیزی رو بیان می‌کنن. در ایران، به فارسی.
            </p>
            <Link href="/products"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-sm font-black text-black transition-all hover:scale-105 active:scale-95"
              style={{ background: '#a855f7', boxShadow: '0 0 30px rgba(168,85,247,0.5)' }}>
              کشف کن
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── DISCOUNT CAPTURE ─────────────────────────────────────────────────────────
function DiscountCapture() {
  const [phone, setPhone]   = useState('');
  const [state, setState]   = useState<'idle'|'loading'|'done'|'error'>('idle');
  const [code, setCode]     = useState('');
  const [errMsg, setErrMsg] = useState('');
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const submit = async () => {
    const cleaned = phone.replace(/\D/g, '');
    if (!/^09\d{9}$/.test(cleaned)) { setErrMsg('شماره موبایل معتبر نیست'); return; }
    setErrMsg('');
    setState('loading');
    try {
      const res  = await fetch('/api/lead/discount', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleaned }),
      });
      const data = await res.json();
      if (!res.ok) { setErrMsg(data.error || 'خطایی رخ داد'); setState('error'); return; }
      setCode(data.code);
      setState('done');
    } catch { setErrMsg('خطای اتصال به سرور'); setState('error'); }
  };

  return (
    <section ref={ref} className="relative py-20 px-4 overflow-hidden" dir="rtl">
      {/* Gradient background */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.08) 0%, transparent 40%, rgba(34,255,136,0.06) 100%)' }} />

      {/* Decorative blobs */}
      <motion.div className="absolute -top-32 -right-32 w-80 h-80 rounded-full pointer-events-none opacity-20"
        style={{ background: 'radial-gradient(circle, var(--primary), transparent 70%)' }}
        animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 8, repeat: Infinity }} />
      <motion.div className="absolute -bottom-32 -left-32 w-72 h-72 rounded-full pointer-events-none opacity-15"
        style={{ background: 'radial-gradient(circle, var(--accent), transparent 70%)' }}
        animate={{ scale: [1.1, 1, 1.1] }} transition={{ duration: 8, repeat: Infinity }} />

      <motion.div className="relative z-10 max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.2, 0, 0, 1] }}>

        {/* Card */}
        <div className="rounded-3xl overflow-hidden border border-border"
          style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-xl)' }}>

          {/* Top accent bar */}
          <div className="h-1 w-full" style={{ background: 'linear-gradient(to left, var(--accent), var(--primary))' }} />

          <div className="p-8 sm:p-12">
            <div className="flex flex-col sm:flex-row items-center gap-8">

              {/* Left: discount circle */}
              <div className="flex-shrink-0">
                <motion.div className="relative w-32 h-32"
                  animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 6, repeat: Infinity }}>
                  <div className="absolute inset-0 rounded-full"
                    style={{ background: 'conic-gradient(from 180deg, var(--primary), var(--accent), var(--primary))', padding: 3 }}>
                    <div className="w-full h-full rounded-full flex flex-col items-center justify-center"
                      style={{ background: 'var(--bg)' }}>
                      <span className="text-3xl font-black" style={{ color: 'var(--accent)', lineHeight: 1 }}>۱۵٪</span>
                      <span className="text-xs font-bold text-muted mt-1">تخفیف</span>
                    </div>
                  </div>
                  {/* Pulse ring */}
                  <motion.div className="absolute inset-0 rounded-full"
                    style={{ border: '2px solid var(--accent)' }}
                    animate={{ scale: [1, 1.3, 1.6], opacity: [0.5, 0.2, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity }} />
                </motion.div>
              </div>

              {/* Right: text + form */}
              <div className="flex-1 text-center sm:text-right">
                {/* Label */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 text-xs font-bold"
                  style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)' }}>
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: 'var(--accent)' }} />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: 'var(--accent)' }} />
                  </span>
                  پیشنهاد محدود — همین الان
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-fg mb-2 leading-tight">
                  اولین خریدت رو <span style={{ color: 'var(--primary)', textShadow: '0 0 20px color-mix(in srgb,var(--primary) 50%,transparent)' }}>ارزان‌تر</span> بخر
                </h2>
                <p className="text-muted text-sm mb-6 leading-relaxed">
                  شماره‌ات رو بذار — یه کد اختصاصی ۱۵٪ تخفیف فقط برای تو صادر می‌کنیم.
                </p>

                <AnimatePresence mode="wait">
                  {state !== 'done' ? (
                    <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -10 }}>
                      <div className="flex gap-2 max-w-sm sm:max-w-none">
                        <input
                          type="tel" dir="ltr" value={phone}
                          onChange={e => { setPhone(e.target.value); setErrMsg(''); }}
                          onKeyDown={e => e.key === 'Enter' && submit()}
                          placeholder="09xxxxxxxxx"
                          className="flex-1 h-12 px-4 rounded-[14px] text-sm text-fg placeholder:text-subtle outline-none transition-all"
                          style={{
                            background: 'var(--surface-2)',
                            border: `1.5px solid ${errMsg ? 'var(--error)' : 'var(--border)'}`,
                          }}
                        />
                        <motion.button onClick={submit}
                          disabled={state === 'loading' || !phone}
                          whileTap={{ scale: 0.96 }}
                          className="h-12 px-6 rounded-[14px] text-sm font-black whitespace-nowrap cursor-pointer disabled:opacity-50 transition-all"
                          style={{ background: 'var(--primary)', color: 'var(--primary-fg)', boxShadow: '0 0 24px color-mix(in srgb,var(--primary) 60%,transparent)' }}>
                          {state === 'loading'
                            ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />ثبت</span>
                            : 'دریافت کد'}
                        </motion.button>
                      </div>
                      {errMsg && <p className="text-xs mt-2 text-center sm:text-right" style={{ color: 'var(--error)' }}>{errMsg}</p>}
                      <p className="text-xs text-subtle mt-3 flex items-center gap-1.5 justify-center sm:justify-start">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                        اطلاعاتت محفوظه — هیچ‌وقت اسپم نمی‌فرستیم
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div key="success"
                      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
                      <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: 'var(--accent-dim)', border: '1.5px solid color-mix(in srgb,var(--accent) 30%,transparent)' }}>
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ color: 'var(--accent)' }}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        <div className="flex-1 text-right">
                          <p className="text-xs text-muted mb-1">کد تخفیف اختصاصی شما:</p>
                          <p className="text-lg font-black font-mono tracking-wider" style={{ color: 'var(--accent)' }}>{code}</p>
                        </div>
                        <button onClick={() => navigator.clipboard.writeText(code)}
                          className="text-xs px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-all hover:opacity-80"
                          style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
                          کپی
                        </button>
                      </div>
                      <p className="text-muted text-xs mt-2 text-center">کد تا ۳۰ روز آینده معتبره. موفق باشی!</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="mt-8 pt-6 border-t border-border grid grid-cols-3 gap-4">
              {[
                { icon: '🔒', label: 'اطلاعات محفوظ' },
                { icon: '⚡', label: 'کد فوری' },
                { icon: '🎯', label: 'فقط یک بار' },
              ].map(({ icon, label }) => (
                <div key={label} className="text-center">
                  <div className="text-lg mb-1">{icon}</div>
                  <p className="text-xs text-subtle font-medium">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function SiteFooter() {
  const { resolvedTheme } = useTheme();
  const [footerMounted, setFooterMounted] = useState(false);
  useEffect(() => setFooterMounted(true), []);
  const logoSrc = footerMounted && resolvedTheme === 'light'
    ? '/balck logo for light theme.png'
    : '/purple logo for dark theme.png';

  return (
    <footer className="border-t border-border mt-8" style={{ background: 'var(--surface)' }} dir="rtl">
      <div className="max-w-7xl mx-auto px-5 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">

          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link href="/">
              <Image src={logoSrc} alt="کاویان" width={160} height={56} className="h-14 w-auto object-contain" />
            </Link>
            <p className="text-sm leading-relaxed text-muted">
              بیپوش آنچه را که هستی.<br />طرح‌های اختصاصی برای فن‌های واقعی.
            </p>
            <div className="flex gap-2">
              <a href="#" aria-label="اینستاگرام" className="w-9 h-9 rounded-xl flex items-center justify-center border border-border text-subtle hover:border-primary hover:text-primary transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                </svg>
              </a>
              <a href="#" aria-label="تلگرام" className="w-9 h-9 rounded-xl flex items-center justify-center border border-border text-subtle hover:border-primary hover:text-primary transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.5 3L2 10.5l7 2.5 2.5 7L15 12l6.5-9z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-fg mb-4">لینک‌های سریع</p>
            <div className="space-y-2.5">
              {[['فروشگاه','/products'],['کالکشن جدید','/products?collection=new'],['پنل کاربری','/user/panel'],['سبد خرید','/cart'],['پشتیبانی','/user/panel']].map(([l,h]) => (
                <Link key={l} href={h} className="block text-sm text-muted hover:text-primary transition-colors">{l}</Link>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-fg mb-4">کالکشن‌ها</p>
            <div className="space-y-2.5">
              {['فیلم و سریال','موسیقی','بازی','فرهنگ ایرانی'].map(l => (
                <Link key={l} href="/products" className="block text-sm text-muted hover:text-primary transition-colors">{l}</Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-subtle">© {new Date().getFullYear()} کاویان — تمامی حقوق محفوظ است.</p>
          <div className="flex gap-4 text-xs text-subtle">
            <Link href="#" className="hover:text-muted transition-colors">حریم خصوصی</Link>
            <Link href="#" className="hover:text-muted transition-colors">قوانین استفاده</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── CATEGORY SHOWCASE ────────────────────────────────────────────────────────
const CAT_CARDS = [
  { id: 'movie',   label: 'فیلم و سریال', sub: 'از دون تا ارباب حلقه‌ها',    src: '/api/uploads/images/UI%20design%20Materails/movie-symbol.png',    neon: '#f43f5e' },
  { id: 'game',    label: 'بازی',          sub: 'دنیای گیمرها رو به تن بپوش', src: '/api/uploads/images/UI%20design%20Materails/game-symbol.png',     neon: '#22d3ee' },
  { id: 'music',   label: 'موسیقی',        sub: 'پینک فلوید و افسانه‌های راک',src: '/api/uploads/images/UI%20design%20Materails/music-sumbol.png',    neon: '#fbbf24' },
  { id: 'culture', label: 'نوستالژی',      sub: 'خاطرات جاودانه',             src: '/api/uploads/images/UI%20design%20Materails/nostalgia-symbol.png', neon: '#34d399' },
];

function CategoryShowcase() {
  const reduce = useReducedMotion();
  const ref    = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="relative py-20 px-5 overflow-hidden" dir="rtl">
      {/* dot grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, var(--fg) 1px, transparent 0)', backgroundSize: '32px 32px' }} />

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">دسته‌بندی‌ها</p>
          <h2 className="text-3xl sm:text-4xl font-black text-fg">دنیاتو انتخاب کن</h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {CAT_CARDS.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 48 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link href="/products"
                className="group relative flex flex-col items-center gap-5 rounded-2xl border p-6 overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                style={{ borderColor: `${c.neon}30`, background: `${c.neon}07` }}>
                {/* hover radial glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(ellipse 80% 60% at 50% 30%, ${c.neon}20, transparent 70%)` }} />

                {/* floating icon */}
                <motion.div
                  className="relative flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28"
                  animate={reduce ? {} : {
                    y:      [0, -(10 + i * 2), 0],
                    rotate: [0, i % 2 === 0 ? 3 : -3, 0],
                  }}
                  transition={{ duration: 4 + i * 0.8, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {/* shadow under icon */}
                  <motion.div
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-14 h-3 rounded-full blur-xl"
                    style={{ background: c.neon }}
                    animate={reduce ? {} : { opacity: [0.5, 0.9, 0.5], scaleX: [0.8, 1.1, 0.8] }}
                    transition={{ duration: 4 + i * 0.8, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <img
                    src={c.src} alt={c.label} loading="lazy"
                    className="w-full h-full object-contain"
                    style={{ filter: `drop-shadow(0 4px 24px ${c.neon}90)` }}
                  />
                </motion.div>

                <div className="text-center relative">
                  <p className="font-bold text-fg text-base mb-1 transition-colors group-hover:text-fg" style={{ textShadow: `0 0 20px ${c.neon}40` }}>
                    {c.label}
                  </p>
                  <p className="text-subtle text-xs leading-relaxed">{c.sub}</p>
                </div>

                {/* bottom accent */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-0 group-hover:w-3/5 rounded-full transition-all duration-500"
                  style={{ background: c.neon, boxShadow: `0 0 10px ${c.neon}` }} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── LATEST PRODUCTS HORIZONTAL SCROLL ───────────────────────────────────────
function LatestProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft]   = useState(false);
  const [canRight, setCanRight] = useState(false);

  useEffect(() => {
    fetch('/api/products?limit=10&sortBy=createdAt&sortOrder=desc')
      .then(r => r.json())
      .then(d => { setProducts(d.data?.products || d.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 10);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateArrows, { passive: true });
    updateArrows();
    return () => el.removeEventListener('scroll', updateArrows);
  }, [products, updateArrows]);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
  };

  return (
    <section className="py-12" dir="rtl">
      <div className="max-w-7xl mx-auto px-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">تازه رسیده</p>
            <h2 className="text-2xl sm:text-3xl font-black text-fg">جدیدترین‌ها</h2>
          </div>
          <div className="flex items-center gap-3">
            {/* Nav arrows */}
            <div className="hidden sm:flex items-center gap-1.5">
              <motion.button
                onClick={() => scroll('left')} disabled={!canLeft}
                whileHover={canLeft ? { scale: 1.08 } : {}}
                whileTap={canLeft ? { scale: 0.93 } : {}}
                aria-label="قبلی"
                className="relative w-10 h-10 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-200 disabled:opacity-20 disabled:cursor-default overflow-hidden"
                style={{
                  background: canLeft ? 'var(--primary)' : 'var(--surface-2)',
                  boxShadow: canLeft ? '0 0 16px color-mix(in srgb,var(--primary) 55%,transparent)' : 'none',
                  color: canLeft ? 'var(--primary-fg)' : 'var(--fg-subtle)',
                }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </motion.button>
              <motion.button
                onClick={() => scroll('right')} disabled={!canRight}
                whileHover={canRight ? { scale: 1.08 } : {}}
                whileTap={canRight ? { scale: 0.93 } : {}}
                aria-label="بعدی"
                className="relative w-10 h-10 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-200 disabled:opacity-20 disabled:cursor-default overflow-hidden"
                style={{
                  background: canRight ? 'var(--primary)' : 'var(--surface-2)',
                  boxShadow: canRight ? '0 0 16px color-mix(in srgb,var(--primary) 55%,transparent)' : 'none',
                  color: canRight ? 'var(--primary-fg)' : 'var(--fg-subtle)',
                }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </motion.button>
            </div>
            <Link href="/products" className="text-sm text-muted hover:text-primary transition-colors flex items-center gap-1">
              همه <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Horizontal scroll */}
        <div className="relative -mx-5 px-5">
          <div ref={scrollRef}
            dir="ltr"
            className="flex gap-4 overflow-x-auto scrollbar-none pb-3"
            style={{ scrollSnapType: 'x mandatory' }}>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-48 sm:w-56" style={{ scrollSnapAlign: 'start' }}>
                    <SkeletonCard />
                  </div>
                ))
              : products.map((p, i) => (
                  <div key={p.id} className="flex-shrink-0 w-48 sm:w-56" style={{ scrollSnapAlign: 'start' }}>
                    <ProductCard product={p} index={i} />
                  </div>
                ))
            }
          </div>
          {/* Left fade */}
          <div className="absolute top-0 left-0 h-full w-10 pointer-events-none"
            style={{ background: 'linear-gradient(to right, var(--bg), transparent)' }} />
          {/* Right fade */}
          <div className="absolute top-0 right-0 h-full w-10 pointer-events-none"
            style={{ background: 'linear-gradient(to left, var(--bg), transparent)' }} />
        </div>
      </div>
    </section>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    fetch('/api/user/cart', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setCartCount(d.data?.CartItem?.length || 0))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <SiteNavbar cartCount={cartCount} />
      <HeroSection />
      <NeonTicker />
      <FeatureStrip />
      <CategoryShowcase />
      <CollectionSpotlight />
      <LatestProducts />

      <DiscountCapture />
      <BrandStory />
      <SiteFooter />
    </div>
  );
}
