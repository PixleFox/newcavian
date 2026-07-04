'use client';

import { useEffect, useState } from 'react';
import { ShoppingBagIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { imageUrl } from '@/lib/imageUrl';

interface OrderItem {
  id: string;
  productName: string;
  variantName?: string;
  quantity: number;
  price: number;
  total: number;
  Product: { name: string; mainImage: string | null };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  createdAt: string;
  OrderItem: OrderItem[];
}

const fmt = (n: number) => new Intl.NumberFormat('fa-IR').format(n);
const fmtDate = (d: string) => new Date(d).toLocaleDateString('fa-IR');

const STATUS: Record<string, { label: string; cls: string }> = {
  DRAFT:            { label: 'پیش‌نویس',       cls: 'badge badge-neutral' },
  PENDING_PAYMENT:  { label: 'در انتظار پرداخت', cls: 'badge badge-neutral' },
  PAYMENT_RECEIVED: { label: 'پرداخت شد',       cls: 'badge badge-primary' },
  PROCESSING:       { label: 'در حال پردازش',   cls: 'badge badge-primary' },
  SHIPPED:          { label: 'ارسال شد',         cls: 'badge badge-primary' },
  OUT_FOR_DELIVERY: { label: 'در راه',           cls: 'badge badge-accent'  },
  DELIVERED:        { label: 'تحویل داده شد',   cls: 'badge badge-success' },
  CANCELLED:        { label: 'لغو شد',           cls: 'badge badge-error'   },
  ON_HOLD:          { label: 'در انتظار',        cls: 'badge badge-neutral' },
};

export default function UserOrders() {
  const [orders, setOrders]     = useState<Order[]>([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/user/orders', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { setOrders(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-2">
      {[1,2,3].map(i => <div key={i} className="h-14 rounded-xl skeleton" />)}
    </div>
  );

  if (orders.length === 0) return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'var(--surface-2)' }}>
        <ShoppingBagIcon className="w-6 h-6 text-subtle" />
      </div>
      <p className="text-muted text-sm">هنوز سفارشی ثبت نکرده‌اید</p>
    </div>
  );

  return (
    <div className="space-y-2" dir="rtl">
      <p className="text-xs text-subtle mb-3">{orders.length} سفارش</p>
      {orders.map(order => {
        const st = STATUS[order.status] || { label: order.status, cls: 'badge badge-neutral' };
        const isOpen = expanded === order.id;
        return (
          <div key={order.id} className="bg-surface border border-border rounded-xl overflow-hidden">
            <button
              onClick={() => setExpanded(e => e === order.id ? null : order.id)}
              className="w-full flex items-center justify-between px-4 py-3 text-right cursor-pointer hover:bg-surface-2/50 transition-colors"
            >
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className={st.cls}>{st.label}</span>
                <span className="text-fg font-mono text-xs">{order.orderNumber}</span>
                <span className="text-subtle text-xs hidden sm:inline">{fmtDate(order.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2.5 flex-shrink-0">
                <span className="text-fg font-semibold text-sm tabular-nums">{fmt(Number(order.total))} <span className="text-xs text-subtle font-normal">تومان</span></span>
                {isOpen
                  ? <ChevronUpIcon className="w-3.5 h-3.5 text-subtle" />
                  : <ChevronDownIcon className="w-3.5 h-3.5 text-subtle" />}
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-border px-4 py-3 space-y-3">
                <div className="space-y-2">
                  {order.OrderItem.map(item => (
                    <div key={item.id} className="flex items-center gap-2.5 text-sm">
                      <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-surface-2">
                        {item.Product?.mainImage && <img src={imageUrl(item.Product.mainImage)} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-fg text-xs truncate">{item.productName}</p>
                        {item.variantName && <p className="text-subtle text-[11px]">{item.variantName}</p>}
                      </div>
                      <span className="text-subtle text-xs">×{item.quantity}</span>
                      <span className="text-fg text-xs tabular-nums">{fmt(Number(item.total))}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border/60 pt-2 flex flex-wrap gap-3 text-xs text-subtle">
                  <span>جمع کالا: {fmt(Number(order.subtotal))} تومان</span>
                  <span>ارسال: {Number(order.shippingCost) === 0 ? 'رایگان' : `${fmt(Number(order.shippingCost))} تومان`}</span>
                  <span>تاریخ: {fmtDate(order.createdAt)}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
