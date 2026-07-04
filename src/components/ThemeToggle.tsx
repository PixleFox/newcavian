'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';

/**
 * Animated day/night switch. A sliding pill: sky-blue daytime with a sun,
 * deep-night with a crescent moon + stars. Self-contained colors so it
 * reads correctly over any background, in either theme.
 */
export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted ? resolvedTheme === 'dark' : true;

  const spring = { type: 'spring' as const, stiffness: 500, damping: 30 };

  return (
    <button
      type="button"
      dir="ltr"
      role="switch"
      aria-checked={!isDark}
      aria-label={isDark ? 'روشن کردن حالت روز' : 'فعال کردن حالت شب'}
      title={isDark ? 'حالت روز' : 'حالت شب'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`relative h-8 w-[60px] shrink-0 rounded-full p-1 overflow-hidden border transition-colors duration-500 cursor-pointer
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
        ${isDark ? 'border-white/15' : 'border-black/10'}`}
      style={{
        background: isDark
          ? 'linear-gradient(160deg,#1e293b,#0b1220)'
          : 'linear-gradient(160deg,#7dd3fc,#38bdf8)',
      }}
    >
      {/* Stars (night) */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: isDark ? 1 : 0 }}
        transition={{ duration: 0.4 }}
      >
        <span className="absolute top-1.5 left-2 h-[2px] w-[2px] rounded-full bg-white/90" />
        <span className="absolute top-3.5 left-4 h-[1.5px] w-[1.5px] rounded-full bg-white/70" />
        <span className="absolute top-2 left-6 h-[1px] w-[1px] rounded-full bg-white/60" />
      </motion.div>

      {/* Cloud (day) */}
      <motion.div
        className="absolute bottom-1 right-2 pointer-events-none"
        animate={{ opacity: isDark ? 0 : 1, y: isDark ? 4 : 0 }}
        transition={{ duration: 0.4 }}
      >
        <span className="block h-1.5 w-4 rounded-full bg-white/85" />
      </motion.div>

      {/* Sliding knob */}
      <motion.div
        layout
        className="relative h-6 w-6 rounded-full flex items-center justify-center"
        animate={{ x: isDark ? 0 : 28 }}
        transition={spring}
        style={{
          background: isDark
            ? 'radial-gradient(circle at 35% 35%,#f1f5f9,#cbd5e1)'
            : 'radial-gradient(circle at 35% 35%,#fde68a,#fbbf24)',
          boxShadow: isDark
            ? '0 0 8px rgba(226,232,240,0.5), inset -2px -2px 4px rgba(0,0,0,0.15)'
            : '0 0 12px rgba(251,191,36,0.8)',
        }}
      >
        {/* Moon craters — only visible in dark */}
        <motion.div
          className="absolute inset-0"
          animate={{ opacity: isDark ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <span className="absolute top-1.5 left-1.5 h-1 w-1 rounded-full bg-slate-400/50" />
          <span className="absolute bottom-1.5 right-2 h-[3px] w-[3px] rounded-full bg-slate-400/40" />
          <span className="absolute top-3 right-1.5 h-[2px] w-[2px] rounded-full bg-slate-400/40" />
        </motion.div>
      </motion.div>
    </button>
  );
}
