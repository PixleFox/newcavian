'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { imageUrl } from '@/lib/imageUrl';
import {
  MagnifyingGlassIcon, ArrowPathIcon, EyeIcon, XMarkIcon,
  CheckCircleIcon, XCircleIcon, TruckIcon, ArchiveBoxIcon,
} from '@heroicons/react/24/outline';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderItem {
  id: string; productName: string; variantName?: string;
  quantity: number; price: number; total: number;
  Product: { name: string; mainImage: string | null };
}

interface Order {
  id: string; orderNumber: string; status: string;
  subtotal: number; shippingCost: number; discountAmount: number; total: number;
  paymentMethod: string | null; paymentStatus: string;
  createdAt: string;
  users: { id: number; full_name: string | null; phone_number: string; email: string | null };
  OrderItem: OrderItem[];
}

const fmt = (n: number) => new Intl.NumberFormat('fa-IR').format(n);
const fmtDate = (d: string) => new Date(d).toLocaleDateString('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' });

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  DRAFT:            { label: 'پیش‌نویس',         cls: 'bg-surface-2 text-muted border-border' },
  PENDING_PAYMENT:  { label: 'در انتظار تأیید',   cls: 'bg-yellow-950 text-yellow-400 border-yellow-800' },
  PAYMENT_RECEIVED: { label: 'پرداخت شد',         cls: 'bg-blue-950 text-blue-400 border-blue-800' },
  PROCESSING:       { label: 'در حال پردازش',     cls: 'bg-purple-950 text-primary border-purple-800' },
  SHIPPED:          { label: 'ارسال شد',           cls: 'bg-indigo-950 text-indigo-400 border-indigo-800' },
  OUT_FOR_DELIVERY: { label: 'در راه',             cls: 'bg-cyan-950 text-cyan-400 border-cyan-800' },
  DELIVERED:        { label: 'تحویل داده شد',     cls: 'bg-green-950 text-success border-green-800' },
  CANCELLED:        { label: 'لغو شد',             cls: 'bg-red-950 text-error border-red-800' },
  ON_HOLD:          { label: 'در انتظار',          cls: 'bg-orange-950 text-orange-400 border-orange-800' },
  REFUNDED:         { label: 'مسترد شد',           cls: 'bg-pink-950 text-pink-400 border-pink-800' },
};

const STATUS_TRANSITIONS: Record<string, { status: string; label: string; cls: string }[]> = {
  PENDING_PAYMENT:  [
    { status: 'PROCESSING', label: 'تأیید سفارش', cls: 'bg-primary hover:bg-primary-hover text-white' },
    { status: 'CANCELLED',  label: 'رد سفارش',    cls: 'bg-error/10 hover:bg-red-900 text-error hover:text-white border border-red-800' },
  ],
  PROCESSING:       [{ status: 'SHIPPED', label: 'ارسال شد', cls: 'bg-indigo-600 hover:bg-indigo-700 text-white' }],
  SHIPPED:          [{ status: 'DELIVERED', label: 'تحویل داده شد', cls: 'bg-green-700 hover:bg-green-800 text-white' }],
  PAYMENT_RECEIVED: [{ status: 'PROCESSING', label: 'شروع پردازش', cls: 'bg-primary hover:bg-primary-hover text-white' }],
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_CFG[status] || { label: status, cls: 'bg-surface-2 text-muted border-border' };
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs border ${s.cls}`}>{s.label}</span>;
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function OrderModal({ order, onClose, onUpdate }: { order: Order; onClose: () => void; onUpdate: (o: Order) => void }) {
  const [loading, setLoading] = useState(false);
  const transitions = STATUS_TRANSITIONS[order.status] || [];

  const changeStatus = async (status: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders?id=${order.id}`, {
        method: 'PATCH', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const d = await res.json();
      if (res.ok) { toast.success('وضعیت به‌روز شد'); onUpdate(d.data); }
      else toast.error(d.error || 'خطا');
    } catch { toast.error('خطای اتصال'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-surface">
          <div>
            <p className="text-fg font-semibold font-mono">{order.orderNumber}</p>
            <p className="text-subtle text-xs mt-0.5">{fmtDate(order.createdAt)}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={order.status} />
            <button onClick={onClose} className="text-subtle hover:text-fg cursor-pointer transition-colors">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Customer */}
          <div className="bg-surface-2/50 rounded-xl p-4">
            <p className="text-xs text-subtle mb-2">مشتری</p>
            <p className="text-fg font-medium">{order.users.full_name || '—'}</p>
            <p className="text-muted text-sm" dir="ltr">{order.users.phone_number}</p>
            {order.users.email && <p className="text-subtle text-sm">{order.users.email}</p>}
          </div>

          {/* Items */}
          <div>
            <p className="text-xs text-subtle mb-2">اقلام سفارش</p>
            <div className="space-y-2">
              {order.OrderItem.map(item => (
                <div key={item.id} className="flex items-center gap-3 bg-surface-2/30 rounded-xl p-3">
                  <div className="w-10 h-10 bg-surface-2 rounded-lg overflow-hidden flex-shrink-0">
                    {item.Product?.mainImage && <img src={imageUrl(item.Product.mainImage)} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-muted text-sm">{item.productName}</p>
                    {item.variantName && <p className="text-subtle text-xs">{item.variantName}</p>}
                  </div>
                  <span className="text-muted text-sm">×{item.quantity}</span>
                  <span className="text-fg text-sm font-medium">{fmt(Number(item.total))} ریال</span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-surface-2/30 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between text-muted"><span>جمع کالاها</span><span>{fmt(Number(order.subtotal))} ریال</span></div>
            <div className="flex justify-between text-muted"><span>ارسال</span><span>{Number(order.shippingCost) === 0 ? 'رایگان' : `${fmt(Number(order.shippingCost))} ریال`}</span></div>
            {Number(order.discountAmount) > 0 && <div className="flex justify-between text-success"><span>تخفیف</span><span>-{fmt(Number(order.discountAmount))} ریال</span></div>}
            <div className="flex justify-between text-fg font-bold border-t border-border pt-2"><span>مبلغ نهایی</span><span>{fmt(Number(order.total))} ریال</span></div>
          </div>

          {/* Actions */}
          {transitions.length > 0 && (
            <div>
              <p className="text-xs text-subtle mb-2">عملیات</p>
              <div className="flex gap-2 flex-wrap">
                {transitions.map(t => (
                  <button key={t.status} onClick={() => changeStatus(t.status)} disabled={loading}
                    className={`px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors disabled:opacity-50 ${t.cls}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OrdersTable() {
  const [orders, setOrders]     = useState<Order[]>([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage]         = useState(1);
  const [selected, setSelected] = useState<Order | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (statusFilter) params.set('status', statusFilter);
    if (search) params.set('search', search);
    const res = await fetch(`/api/admin/orders?${params}`, { credentials: 'include' });
    const d   = await res.json();
    setOrders(d.data || []);
    setTotal(d.total || 0);
    setLoading(false);
  }, [page, statusFilter, search]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const handleUpdate = (updated: Order) => {
    setOrders(p => p.map(o => o.id === updated.id ? { ...o, ...updated } : o));
    setSelected(s => s?.id === updated.id ? { ...s, ...updated } : s);
  };

  const statusCounts = orders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-bg text-fg" dir="rtl">
      <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-fg">مدیریت سفارش‌ها</h1>
            <p className="text-sm text-subtle mt-0.5">{fmt(total)} سفارش</p>
          </div>
          <button onClick={fetch_} className="p-2 rounded-lg bg-surface-2 hover:bg-surface-3 text-muted hover:text-fg cursor-pointer transition-all">
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { key: 'PENDING_PAYMENT', label: 'در انتظار تأیید', color: 'text-yellow-400' },
            { key: 'PROCESSING',      label: 'در پردازش',       color: 'text-primary' },
            { key: 'SHIPPED',         label: 'ارسال شده',        color: 'text-indigo-400' },
            { key: 'DELIVERED',       label: 'تحویل شده',        color: 'text-success' },
          ].map(s => (
            <div key={s.key} className="bg-surface border border-border rounded-xl px-4 py-3 cursor-pointer hover:border-border-strong transition-colors"
              onClick={() => setStatusFilter(f => f === s.key ? '' : s.key)}>
              <p className="text-xs text-subtle">{s.label}</p>
              <p className={`text-xl font-bold mt-0.5 ${s.color}`}>{fmt(statusCounts[s.key] || 0)}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-52">
            <MagnifyingGlassIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="شماره سفارش، نام یا شماره مشتری..."
              className="admin-input pr-9" />
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="admin-input cursor-pointer w-auto">
            <option value="">همه وضعیت‌ها</option>
            {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-2/60">
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted">شماره سفارش</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted">مشتری</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted">مبلغ</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted">وضعیت</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted">تاریخ</th>
                  <th className="px-4 py-3 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loading
                  ? Array(5).fill(0).map((_, i) => (
                    <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-4 bg-surface-2 rounded animate-pulse" /></td></tr>
                  ))
                  : orders.length === 0
                    ? <tr><td colSpan={6} className="py-16 text-center text-subtle">سفارشی یافت نشد</td></tr>
                    : orders.map(order => (
                      <tr key={order.id} className="hover:bg-surface-2/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-primary text-sm">{order.orderNumber}</td>
                        <td className="px-4 py-3">
                          <p className="text-muted text-sm">{order.users.full_name || '—'}</p>
                          <p className="text-subtle text-xs" dir="ltr">{order.users.phone_number}</p>
                        </td>
                        <td className="px-4 py-3 text-fg font-semibold tabular-nums">{fmt(Number(order.total))} ریال</td>
                        <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                        <td className="px-4 py-3 text-subtle text-xs tabular-nums">{fmtDate(order.createdAt)}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => setSelected(order)}
                            className="p-1.5 rounded-lg hover:bg-surface-3 text-muted hover:text-fg cursor-pointer transition-colors">
                            <EyeIcon className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div className="flex justify-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p-1)}
              className="btn btn-md btn-ghost disabled:opacity-40">
              قبلی
            </button>
            <span className="px-4 py-2 text-sm text-subtle">صفحه {fmt(page)} از {fmt(Math.ceil(total/20))}</span>
            <button disabled={page >= Math.ceil(total/20)} onClick={() => setPage(p => p+1)}
              className="btn btn-md btn-ghost disabled:opacity-40">
              بعدی
            </button>
          </div>
        )}
      </div>

      {selected && <OrderModal order={selected} onClose={() => setSelected(null)} onUpdate={handleUpdate} />}
    </div>
  );
}
