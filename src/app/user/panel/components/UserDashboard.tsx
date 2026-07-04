'use client';
import { useEffect, useState } from 'react';
import { ShoppingBagIcon, HeartIcon, LifebuoyIcon, UserIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

const fmt = (n: number) => new Intl.NumberFormat('fa-IR').format(n);
const fmtDate = (d: string) => new Date(d).toLocaleDateString('fa-IR');

const STATUS: Record<string, { label: string; cls: string }> = {
  PENDING_PAYMENT: { label: 'در انتظار پرداخت', cls: 'badge badge-neutral' },
  PROCESSING:      { label: 'در حال پردازش',    cls: 'badge badge-primary' },
  SHIPPED:         { label: 'ارسال شد',          cls: 'badge badge-primary' },
  DELIVERED:       { label: 'تحویل شده',         cls: 'badge badge-success' },
  CANCELLED:       { label: 'لغو شد',            cls: 'badge badge-error'   },
};

export default function UserDashboard() {
  const [user, setUser]       = useState<any>(null);
  const [orders, setOrders]   = useState<any[]>([]);
  const [wishCnt, setWishCnt] = useState(0);
  const [tickCnt, setTickCnt] = useState(0);

  useEffect(() => {
    fetch('/api/user/auth/me', { credentials: 'include' })
      .then(r => r.json()).then(d => { if (d.authenticated) setUser(d.data); });
    fetch('/api/user/orders', { credentials: 'include' })
      .then(r => r.json()).then(d => setOrders(d.data?.slice(0, 3) || []));
    fetch('/api/user/wishlist', { credentials: 'include' })
      .then(r => r.json()).then(d => setWishCnt(d.data?.length || 0));
    fetch('/api/user/tickets', { credentials: 'include' })
      .then(r => r.json()).then(d => setTickCnt(d.data?.length || 0));
  }, []);

  const stats = [
    { label: 'سفارش‌ها',   value: fmt(orders.length), icon: ShoppingBagIcon },
    { label: 'علاقه‌مندی', value: fmt(wishCnt),        icon: HeartIcon       },
    { label: 'تیکت‌ها',    value: fmt(tickCnt),        icon: LifebuoyIcon    },
    { label: 'امتیاز',     value: '۰',                 icon: UserIcon        },
  ];

  return (
    <div className="space-y-5" dir="rtl">

      {/* Welcome */}
      {user && (
        <div
          className="relative overflow-hidden rounded-2xl border border-primary/20 px-5 py-4 flex items-center gap-4"
          style={{ background: 'linear-gradient(135deg, var(--primary)/8% 0%, var(--surface) 100%)' }}
        >
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at top right, var(--primary) 0%, transparent 70%)' }}
          />
          <div className="relative w-11 h-11 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary text-base font-bold flex-shrink-0">
            {(user.fullName || user.phone || '?')[0]}
          </div>
          <div className="relative min-w-0">
            <p className="text-fg font-semibold truncate">{user.fullName || 'کاربر عزیز'}</p>
            <p className="text-subtle text-sm font-mono" dir="ltr">{user.phone}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-surface border border-border rounded-xl px-3 py-3 hover:border-primary/30 transition-colors duration-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-subtle">{s.label}</p>
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary-dim)' }}>
                  <Icon className="w-3.5 h-3.5 text-primary" />
                </div>
              </div>
              <p className="text-xl font-bold text-fg tabular-nums">{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <h2 className="text-sm font-semibold text-fg">آخرین سفارش‌ها</h2>
          <button
            onClick={() => {}}
            className="text-xs text-primary hover:text-primary/80 cursor-pointer transition-colors"
          >
            همه سفارش‌ها
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <ShoppingBagIcon className="w-8 h-8 text-subtle" />
            <p className="text-subtle text-sm">هنوز سفارشی ثبت نکرده‌اید</p>
          </div>
        ) : (
          orders.map((o) => {
            const st = STATUS[o.status] ?? { label: o.status, cls: 'badge badge-neutral' };
            return (
              <div key={o.id} className="flex items-center justify-between px-5 py-3.5 border-b border-border/60 last:border-0 hover:bg-surface-2/40 transition-colors duration-150">
                <div className="min-w-0">
                  <p className="text-fg text-sm font-mono truncate">{o.orderNumber}</p>
                  <p className="text-subtle text-xs mt-0.5">{fmtDate(o.createdAt)}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0 mr-3">
                  <p className="text-fg text-sm font-semibold tabular-nums">{fmt(Number(o.total))} <span className="text-subtle font-normal text-xs">تومان</span></p>
                  <span className={st.cls}>{st.label}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
