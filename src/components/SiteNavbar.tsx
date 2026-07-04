'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Bars3Icon, XMarkIcon, UserIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import ThemeToggle from '@/components/ThemeToggle';
import { useTheme } from 'next-themes';

const NAV_LINKS = [
  { label: 'محصولات', href: '/products' },
  { label: 'کالکشن جدید', href: '/products?collection=new', badge: 'new' },
  { label: 'درباره ما', href: '/about' },
  { label: 'وبلاگ', href: '/blog' },
];

function Logo() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const src = mounted && resolvedTheme === 'light'
    ? '/balck logo for light theme.png'
    : '/purple logo for dark theme.png';
  return (
    <Link href="/" className="flex items-center shrink-0">
      <Image src={src} alt="کاویان" width={150} height={48} className="object-contain h-11 w-auto" priority />
    </Link>
  );
}

export default function SiteNavbar({ cartCount = 0 }: { cartCount?: number }) {
  const [open, setOpen]         = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authed, setAuthed]     = useState<boolean | null>(null);

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

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? 'bg-bg/85 backdrop-blur-2xl border-b border-border shadow-[0_1px_30px_rgba(0,0,0,0.4)]' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between" dir="rtl">

        <Logo />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-muted">
          {NAV_LINKS.map(({ label, href, badge }) => (
            <Link key={href} href={href}
              className="relative flex items-center gap-1.5 hover:text-fg transition-colors group">
              {label}
              {badge === 'new' && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ background: '#22ff88' }} />
                  <span className="relative inline-flex rounded-full h-2 w-2"
                    style={{ background: '#22ff88', boxShadow: '0 0 6px #22ff88' }} />
                </span>
              )}
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-primary group-hover:w-full transition-all duration-300" />
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {authed === false && (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/user/login"
                className="relative px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 cursor-pointer overflow-hidden group"
                style={{ borderColor: 'var(--primary)', color: 'var(--primary)', boxShadow: '0 0 12px color-mix(in srgb,var(--primary) 20%,transparent)' }}>
                <span className="relative z-10">ورود</span>
                <span className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
              </Link>
              <Link href="/user/login"
                className="relative px-4 py-2 rounded-xl text-sm font-bold cursor-pointer overflow-hidden group transition-all duration-200"
                style={{ background: 'var(--primary)', color: 'var(--primary-fg)', boxShadow: '0 0 16px color-mix(in srgb,var(--primary) 50%,transparent)' }}>
                <span className="relative z-10">ثبت نام</span>
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.18) 60%,transparent 80%)' }} />
              </Link>
            </div>
          )}

          {authed && (
            <Link href="/user/panel"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all duration-200 cursor-pointer"
              style={{ borderColor: 'var(--border-strong)', color: 'var(--fg-muted)', background: 'var(--surface)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)'; (e.currentTarget as HTMLElement).style.color = 'var(--primary)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'; (e.currentTarget as HTMLElement).style.color = 'var(--fg-muted)'; }}>
              <UserIcon style={{ width: 15, height: 15 }} />
              <span>پروفایل</span>
            </Link>
          )}

          {authed && (
            <Link href="/cart"
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold cursor-pointer transition-all duration-200"
              style={{ background: 'var(--primary)', color: 'var(--primary-fg)', boxShadow: '0 0 14px color-mix(in srgb,var(--primary) 40%,transparent)' }}>
              <ShoppingCartIcon style={{ width: 15, height: 15 }} />
              <span className="hidden sm:inline">سبد خرید</span>
              {cartCount > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 rounded-full text-[10px] flex items-center justify-center font-bold tabular-nums"
                  style={{ background: 'rgba(255,255,255,0.25)', color: 'var(--primary-fg)' }}>
                  {cartCount}
                </span>
              )}
            </Link>
          )}

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
              {NAV_LINKS.map(({ label, href, badge }) => (
                <Link key={href} href={href} onClick={() => setOpen(false)}
                  className="flex items-center gap-2 py-3 text-muted hover:text-fg border-b border-border last:border-0 transition-colors">
                  {label}
                  {badge === 'new' && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#22ff88' }} />
                      <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: '#22ff88' }} />
                    </span>
                  )}
                </Link>
              ))}
              {authed && (
                <div className="flex gap-2 pt-3">
                  <Link href="/user/panel" onClick={() => setOpen(false)}
                    className="flex-1 text-center py-2 rounded-xl text-sm font-semibold border cursor-pointer"
                    style={{ borderColor: 'var(--border-strong)', color: 'var(--fg-muted)', background: 'var(--surface)' }}>
                    پروفایل
                  </Link>
                  <Link href="/cart" onClick={() => setOpen(false)}
                    className="flex-1 text-center py-2 rounded-xl text-sm font-bold cursor-pointer"
                    style={{ background: 'var(--primary)', color: 'var(--primary-fg)' }}>
                    سبد خرید
                  </Link>
                </div>
              )}
              {authed === false && (
                <div className="flex gap-2 pt-3">
                  <Link href="/user/login" onClick={() => setOpen(false)}
                    className="flex-1 text-center py-2 rounded-xl text-sm font-semibold border cursor-pointer"
                    style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>ورود</Link>
                  <Link href="/user/login" onClick={() => setOpen(false)}
                    className="flex-1 text-center py-2 rounded-xl text-sm font-bold cursor-pointer"
                    style={{ background: 'var(--primary)', color: 'var(--primary-fg)' }}>ثبت نام</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
