'use client';
import { useEffect, useState } from 'react';
import {
  UserGroupIcon, ShoppingBagIcon, CubeIcon,
  TicketIcon, ArrowTrendingUpIcon, ClockIcon,
} from '@heroicons/react/24/outline';

interface Stats {
  totalUsers: number; newUsers: number;
  totalOrders: number; pendingOrders: number; totalRevenue: number;
  totalProducts: number; activeProducts: number;
  openTickets: number;
}

const fmt = (n: number) => new Intl.NumberFormat('fa-IR').format(n);

export default function Dashboard() {
  const [stats, setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.success) setStats(d.data); })
      .finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { label: 'کاربران',       value: fmt(stats.totalUsers),   sub: `+${fmt(stats.newUsers)} این هفته`,       icon: UserGroupIcon,     color: 'text-blue-400',   bg: 'bg-blue-950/50 border-blue-900/40' },
    { label: 'سفارش‌ها',     value: fmt(stats.totalOrders),  sub: `${fmt(stats.pendingOrders)} در انتظار`,  icon: ShoppingBagIcon,   color: 'text-primary',    bg: 'bg-purple-950/50 border-purple-900/40' },
    { label: 'درآمد (ریال)',  value: fmt(stats.totalRevenue), sub: 'تحویل + ارسال + پردازش',                 icon: ArrowTrendingUpIcon,color: 'text-success',    bg: 'bg-green-950/50 border-green-900/40' },
    { label: 'محصولات',       value: fmt(stats.totalProducts),sub: `${fmt(stats.activeProducts)} فعال`,      icon: CubeIcon,          color: 'text-yellow-400', bg: 'bg-yellow-950/50 border-yellow-900/40' },
    { label: 'تیکت‌های باز', value: fmt(stats.openTickets),  sub: 'نیاز به بررسی',                          icon: TicketIcon,         color: 'text-orange-400', bg: 'bg-orange-950/50 border-orange-900/40' },
  ] : [];

  return (
    <div className="min-h-screen bg-bg text-fg" dir="rtl">
      <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-fg">داشبورد</h1>
          <p className="text-sm text-subtle mt-0.5">خلاصه وضعیت سیستم</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {Array(5).fill(0).map((_, i) => <div key={i} className="h-28 bg-surface-2 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {cards.map(c => (
              <div key={c.label} className={`border rounded-2xl px-5 py-4 ${c.bg}`}>
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs text-muted">{c.label}</p>
                  <c.icon className={`w-5 h-5 ${c.color}`} />
                </div>
                <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
                <p className="text-xs text-subtle mt-1">{c.sub}</p>
              </div>
            ))}
          </div>
        )}

        {!loading && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-surface border border-border rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-muted mb-4 flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-primary" /> وضعیت سفارش‌ها
              </h2>
              <div className="space-y-3">
                {[
                  { label: 'در انتظار تأیید', value: stats.pendingOrders,                                 color: 'bg-yellow-500' },
                  { label: 'تحویل داده شده',  value: stats.totalOrders - stats.pendingOrders,            color: 'bg-green-500' },
                ].map(r => (
                  <div key={r.label}>
                    <div className="flex justify-between text-xs text-muted mb-1">
                      <span>{r.label}</span><span>{fmt(r.value)}</span>
                    </div>
                    <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                      <div className={`h-full ${r.color} rounded-full`}
                        style={{ width: stats.totalOrders ? `${(r.value / stats.totalOrders) * 100}%` : '0%' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-muted mb-4 flex items-center gap-2">
                <CubeIcon className="w-4 h-4 text-yellow-400" /> وضعیت محصولات
              </h2>
              <div className="space-y-3">
                {[
                  { label: 'فعال',     value: stats.activeProducts,                          color: 'bg-green-500' },
                  { label: 'غیرفعال', value: stats.totalProducts - stats.activeProducts,     color: 'bg-surface-3' },
                ].map(r => (
                  <div key={r.label}>
                    <div className="flex justify-between text-xs text-muted mb-1">
                      <span>{r.label}</span><span>{fmt(r.value)}</span>
                    </div>
                    <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                      <div className={`h-full ${r.color} rounded-full`}
                        style={{ width: stats.totalProducts ? `${(r.value / stats.totalProducts) * 100}%` : '0%' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
