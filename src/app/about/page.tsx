'use client';

import { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import SiteNavbar from '@/components/SiteNavbar';

// ── Helpers ────────────────────────────────────────────────────────────────────
function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }} className={className}>
      {children}
    </motion.div>
  );
}

// ── Data ───────────────────────────────────────────────────────────────────────
const VALUES = [
  { icon: '🎨', title: 'طراحی اصیل', desc: 'هر طرح از دل فرهنگ و هنر ایرانی برمی‌خیزد. نه کپی، نه تقلید — خلق محض.' },
  { icon: '✦', title: 'کیفیت بی‌توافق', desc: 'از جنس پارچه تا آخرین بخیه، هیچ جزئیاتی از نگاه ما پنهان نمی‌ماند.' },
  { icon: '🌱', title: 'پایداری', desc: 'چاپ درخواستی (on-demand) یعنی صفر ضایعات انبار، تولید هدفمند.' },
  { icon: '⚡', title: 'جامعه‌محور', desc: 'شما نه فقط خریدار — بلکه بخشی از یک جنبش بصری هستید.' },
];

const STATS = [
  { value: '۲۰۰+', label: 'طرح منتشرشده' },
  { value: '۱۲K+', label: 'مشتری راضی' },
  { value: '۴.۹', label: 'امتیاز میانگین' },
  { value: '۱۴', label: 'شهر پوشش‌دهی' },
];

const TEAM = [
  { name: 'علیرضا اسلامی', role: 'بنیانگذار و مدیر خلاقیت', color: '#a855f7' },
  { name: 'نیلوفر رضایی', role: 'طراح ارشد', color: '#22ff88' },
  { name: 'آرمان کریمی', role: 'مدیر محصول', color: '#f43f5e' },
];

// ── Component ──────────────────────────────────────────────────────────────────
export default function AboutPage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY  = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOp = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div className="min-h-dvh bg-bg text-fg" dir="rtl">
      <SiteNavbar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-[90dvh] flex items-center justify-center overflow-hidden pt-16">
        {/* parallax bg */}
        <motion.div className="absolute inset-0 pointer-events-none" style={{ y: heroY }}>
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(168,85,247,0.18) 0%, rgba(34,255,136,0.06) 50%, transparent 70%)'
          }} />
          {/* animated grid */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          {/* floating orbs */}
          {[
            { size: 300, x: '15%', y: '20%', color: 'rgba(168,85,247,0.15)', delay: 0 },
            { size: 200, x: '75%', y: '60%', color: 'rgba(34,255,136,0.12)', delay: 1.5 },
            { size: 150, x: '60%', y: '15%', color: 'rgba(244,63,94,0.10)', delay: 0.8 },
          ].map((orb, i) => (
            <motion.div key={i}
              className="absolute rounded-full blur-3xl pointer-events-none"
              style={{ width: orb.size, height: orb.size, left: orb.x, top: orb.y, background: orb.color }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 6 + i, delay: orb.delay, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </motion.div>

        <motion.div style={{ opacity: heroOp }} className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'backOut' }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold mb-6"
            style={{ borderColor: 'rgba(168,85,247,0.4)', color: 'var(--primary)', background: 'rgba(168,85,247,0.08)' }}>
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: 'var(--primary)' }} />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: 'var(--primary)' }} />
            </span>
            از ۱۴۰۲ تا امروز
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black leading-tight mb-6">
            <span className="text-fg">ما </span>
            <span style={{ background: 'linear-gradient(135deg, var(--primary), #22ff88)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              کاویان
            </span>
            <span className="text-fg"> هستیم</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="text-lg md:text-xl text-muted leading-relaxed max-w-2xl mx-auto mb-10">
            برندی که از دل فرهنگ ایرانی سر برآورده — جایی که هنر، هویت و مد در هم تنیده می‌شوند تا پوشاکی بسازند که روایتگر شماست.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products"
              className="px-8 py-3.5 rounded-xl font-bold text-sm cursor-pointer transition-all"
              style={{ background: 'var(--primary)', color: 'var(--primary-fg)', boxShadow: '0 0 20px color-mix(in srgb,var(--primary) 50%,transparent)' }}>
              مشاهده محصولات
            </Link>
            <a href="#story"
              className="px-8 py-3.5 rounded-xl font-semibold text-sm border cursor-pointer transition-all hover:bg-fg/5"
              style={{ borderColor: 'var(--border-strong)', color: 'var(--fg-muted)' }}>
              داستان ما ↓
            </a>
          </motion.div>
        </motion.div>

        {/* scroll hint */}
        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <div className="w-6 h-10 rounded-full border-2 flex items-start justify-center pt-1.5" style={{ borderColor: 'var(--border)' }}>
            <motion.div className="w-1 h-2.5 rounded-full" style={{ background: 'var(--primary)' }}
              animate={{ opacity: [1, 0, 1] }} transition={{ duration: 2, repeat: Infinity }} />
          </div>
        </motion.div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────────── */}
      <section className="py-16 border-y border-border bg-surface/50">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s, i) => (
            <FadeUp key={s.label} delay={i * 0.1}>
              <div className="text-center">
                <p className="text-4xl font-black text-fg tabular-nums" style={{ textShadow: '0 0 20px color-mix(in srgb,var(--primary) 40%,transparent)' }}>
                  {s.value}
                </p>
                <p className="text-sm text-muted mt-1">{s.label}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── STORY ────────────────────────────────────────────────────────── */}
      <section id="story" className="py-24 px-4 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <FadeUp>
            <div className="relative">
              {/* visual card */}
              <div className="relative rounded-3xl overflow-hidden border border-border bg-surface-2 aspect-square max-w-sm mx-auto">
                <div className="absolute inset-0" style={{
                  background: 'radial-gradient(circle at 30% 30%, rgba(168,85,247,0.25), transparent 60%), radial-gradient(circle at 70% 70%, rgba(34,255,136,0.15), transparent 60%)'
                }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}>
                    <Image src="/bluelogo.png" alt="کاویان" width={140} height={140} className="object-contain drop-shadow-2xl" />
                  </motion.div>
                </div>
                {/* corner glows */}
                <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-60"
                  style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.4), transparent)' }} />
                <div className="absolute bottom-0 left-0 w-24 h-24 rounded-tr-full opacity-60"
                  style={{ background: 'radial-gradient(circle, rgba(34,255,136,0.3), transparent)' }} />
              </div>
              {/* floating badge */}
              <motion.div
                className="absolute -bottom-4 -left-4 bg-surface border border-border rounded-2xl px-4 py-3 shadow-lg"
                animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
                <p className="text-xs text-muted">بنیان‌گذاری</p>
                <p className="text-lg font-black text-fg">۱۴۰۲</p>
              </motion.div>
            </div>
          </FadeUp>

          <FadeUp delay={0.2}>
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full"
                style={{ color: 'var(--primary)', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)' }}>
                داستان ما
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-fg leading-tight">
                از یک ایده ساده<br />
                <span style={{ color: 'var(--primary)' }}>تا یک جنبش</span>
              </h2>
              <div className="space-y-4 text-muted leading-relaxed">
                <p>
                  کاویان در تابستان ۱۴۰۲ با یک سوال ساده متولد شد: چرا نمی‌توانیم لباسی بپوشیم که واقعاً بازتاب هویت ما باشد؟
                </p>
                <p>
                  ما با چند طرح خودساخته شروع کردیم — طرح‌هایی که ریشه در اساطیر ایرانی، موسیقی زیرزمینی و هنر خیابانی داشتند. واکنش مردم باورنکردنی بود.
                </p>
                <p>
                  امروز کاویان نه فقط یک برند لباس، بلکه یک زبان مشترک است — برای کسانی که می‌خواهند «خودشان» باشند.
                </p>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── VALUES ───────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-surface/30 border-y border-border">
        <div className="max-w-5xl mx-auto">
          <FadeUp className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-fg mb-4">ارزش‌هایی که به آن‌ها ایمان داریم</h2>
            <p className="text-muted max-w-xl mx-auto">اینها صرفاً شعار نیستند — هر خط از کدمان، هر بخیه از محصولمان بر اساس این اصول شکل می‌گیرد.</p>
          </FadeUp>
          <div className="grid sm:grid-cols-2 gap-6">
            {VALUES.map((v, i) => (
              <FadeUp key={v.title} delay={i * 0.1}>
                <motion.div
                  className="bg-surface border border-border rounded-2xl p-6 h-full cursor-default"
                  whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(168,85,247,0.12)' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                  <div className="text-3xl mb-4">{v.icon}</div>
                  <h3 className="text-lg font-bold text-fg mb-2">{v.title}</h3>
                  <p className="text-muted text-sm leading-relaxed">{v.desc}</p>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ─────────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 max-w-5xl mx-auto">
        <FadeUp className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-fg mb-4">تیم ما</h2>
          <p className="text-muted">افراد پشت پرده کاویان</p>
        </FadeUp>
        <div className="grid sm:grid-cols-3 gap-6">
          {TEAM.map((m, i) => (
            <FadeUp key={m.name} delay={i * 0.15}>
              <motion.div
                className="bg-surface border border-border rounded-2xl p-6 text-center"
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                {/* avatar */}
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-black"
                  style={{ background: `${m.color}20`, border: `2px solid ${m.color}40`, color: m.color, boxShadow: `0 0 16px ${m.color}30` }}>
                  {m.name[0]}
                </div>
                <h3 className="font-bold text-fg">{m.name}</h3>
                <p className="text-muted text-sm mt-1">{m.role}</p>
              </motion.div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <FadeUp>
          <div className="max-w-3xl mx-auto text-center relative rounded-3xl overflow-hidden p-12 border border-border"
            style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.12), rgba(34,255,136,0.06))' }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 0%, rgba(168,85,247,0.2), transparent)' }} />
            <motion.div className="relative z-10"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}>
              <h2 className="text-3xl md:text-4xl font-black text-fg mb-4">بخشی از کاویان شو</h2>
              <p className="text-muted mb-8 leading-relaxed">
                هر محصولی که می‌خری، روایت یک هنرمند ایرانی را حمایت می‌کنی. بیا با هم تاریخ بسازیم.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/products"
                  className="px-8 py-3.5 rounded-xl font-bold text-sm cursor-pointer transition-all"
                  style={{ background: 'var(--primary)', color: 'var(--primary-fg)', boxShadow: '0 0 24px color-mix(in srgb,var(--primary) 55%,transparent)' }}>
                  خرید کن
                </Link>
                <Link href="/user/login"
                  className="px-8 py-3.5 rounded-xl font-semibold text-sm border cursor-pointer hover:bg-fg/5 transition-all"
                  style={{ borderColor: 'var(--border-strong)', color: 'var(--fg-muted)' }}>
                  عضو شو
                </Link>
              </div>
            </motion.div>
          </div>
        </FadeUp>
      </section>

      {/* footer spacer */}
      <div className="h-8" />
    </div>
  );
}
