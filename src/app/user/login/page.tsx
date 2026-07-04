'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Smartphone, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!phone || !/^09\d{9}$/.test(phone)) {
      setError('شماره موبایل معتبر نیست (مثال: 09123456789)');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/user/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('با موفقیت وارد شدید 🎉');
        router.push('/user/panel');
      } else {
        setError(data.error || 'خطا در ورود');
      }
    } catch {
      setError('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] p-4" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <span className="text-2xl font-black text-white tracking-tight">Cavian</span>
          </Link>
          <p className="text-gray-500 text-sm mt-2">ورود به حساب کاربری</p>
        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">شماره موبایل</label>
              <div className="relative">
                <Smartphone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="09123456789"
                  dir="ltr"
                  className="w-full bg-[#1e2535] border border-gray-700 text-white text-center placeholder-gray-600 rounded-xl pr-9 pl-4 py-3 text-sm focus:ring-2 focus:ring-purple-600/40 focus:border-purple-700 outline-none transition-all"
                  maxLength={11}
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-950/40 border border-red-900/40 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-all cursor-pointer shadow-lg shadow-purple-900/30"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowLeft size={16} />}
              {loading ? 'در حال ورود...' : 'ورود به حساب'}
            </button>
          </form>

          <div className="mt-4 p-3 bg-amber-950/30 border border-amber-800/30 rounded-lg">
            <p className="text-amber-400 text-xs text-center">
              حالت تست: فقط شماره موبایل وارد کنید (بدون رمز)
            </p>
          </div>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          با ورود، <Link href="/privacy" className="text-gray-400 hover:text-white underline">قوانین استفاده</Link> را می‌پذیرید
        </p>
      </motion.div>
    </div>
  );
}
