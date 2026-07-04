'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

const LINKS = [
  {
    title: 'فروشگاه',
    items: [
      { label: 'همه محصولات', href: '/products' },
      { label: 'کالکشن جدید', href: '/products?collection=new' },
      { label: 'درباره ما', href: '/about' },
      { label: 'وبلاگ', href: '/blog' },
    ],
  },
  {
    title: 'حساب کاربری',
    items: [
      { label: 'ورود', href: '/user/login' },
      { label: 'ثبت نام', href: '/user/login' },
      { label: 'پنل کاربری', href: '/user/panel' },
      { label: 'سفارش‌ها', href: '/user/panel' },
    ],
  },
  {
    title: 'پشتیبانی',
    items: [
      { label: 'تماس با ما', href: '#' },
      { label: 'سوالات متداول', href: '#' },
      { label: 'ارسال تیکت', href: '/user/panel' },
      { label: 'info@cavian.ir', href: 'mailto:info@cavian.ir' },
    ],
  },
];

export default function Footer() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const logoSrc = mounted
    ? resolvedTheme === 'light'
      ? '/balck logo for light theme.png'
      : '/purple logo for dark theme.png'
    : '/purple logo for dark theme.png';

  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border" style={{ background: 'var(--surface)' }} dir="rtl">
      <div className="max-w-7xl mx-auto px-5 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">

          {/* Brand column */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-5">
            <Link href="/">
              <Image
                src={logoSrc}
                alt="کاویان"
                width={160}
                height={56}
                className="h-14 w-auto object-contain"
                priority
              />
            </Link>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
              بیپوش آنچه را که هستی.<br />طرح‌های اختصاصی برای فن‌های واقعی.
            </p>
            <div className="flex gap-2">
              <a href="#" aria-label="اینستاگرام"
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                style={{ border: '1px solid var(--border)', color: 'var(--fg-subtle)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)'; (e.currentTarget as HTMLElement).style.color = 'var(--primary)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--fg-subtle)'; }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a href="#" aria-label="تلگرام"
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                style={{ border: '1px solid var(--border)', color: 'var(--fg-subtle)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)'; (e.currentTarget as HTMLElement).style.color = 'var(--primary)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--fg-subtle)'; }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.5 3L2 10.5l7 2.5 2.5 7L15 12l6.5-9z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Link columns */}
          {LINKS.map(col => (
            <div key={col.title}>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--fg)' }}>
                {col.title}
              </p>
              <ul className="space-y-2.5">
                {col.items.map(item => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm transition-colors"
                      style={{ color: 'var(--fg-muted)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-muted)')}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--fg-subtle)' }}>
            © {year} کاویان — تمامی حقوق محفوظ است.
          </p>
          <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--fg-subtle)' }}>
            <Link href="#" onMouseEnter={e => (e.currentTarget.style.color = 'var(--fg-muted)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-subtle)')}>حریم خصوصی</Link>
            <Link href="#" onMouseEnter={e => (e.currentTarget.style.color = 'var(--fg-muted)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-subtle)')}>قوانین استفاده</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
