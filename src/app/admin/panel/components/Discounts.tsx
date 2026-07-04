'use client';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
  PlusIcon, PencilSquareIcon, TrashIcon,
  XMarkIcon, ArrowPathIcon, TagIcon,
} from '@heroicons/react/24/outline';

interface Discount {
  id: string; code: string; description: string | null;
  type: string; value: number; minOrder: number;
  maxUses: number; usedCount: number; isActive: boolean;
  expiresAt: string | null; createdAt: string;
}

const fmt  = (n: number) => new Intl.NumberFormat('fa-IR').format(n);
const fmtD = (d: string) => new Date(d).toLocaleDateString('fa-IR');

const EMPTY = { code: '', description: '', type: 'PERCENTAGE', value: '', minOrder: '0', maxUses: '0', isActive: true, expiresAt: '' };

function DiscountModal({ discount, onClose, onSaved }: {
  discount?: Discount | null; onClose: () => void; onSaved: (d: Discount) => void;
}) {
  const isEdit = !!discount;
  const [form, setForm] = useState(discount
    ? { code: discount.code, description: discount.description || '', type: discount.type, value: String(discount.value), minOrder: String(discount.minOrder), maxUses: String(discount.maxUses), isActive: discount.isActive, expiresAt: discount.expiresAt ? discount.expiresAt.slice(0, 10) : '' }
    : EMPTY
  );
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.code || !form.value) { toast.error('کد و مقدار الزامی است'); return; }
    setSaving(true);
    const url    = isEdit ? `/api/admin/discounts?id=${discount!.id}` : '/api/admin/discounts';
    const method = isEdit ? 'PATCH' : 'POST';
    const res    = await fetch(url, { method, credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const d      = await res.json();
    setSaving(false);
    if (!res.ok) { toast.error(d.error || 'خطا'); return; }
    toast.success(isEdit ? 'ویرایش شد' : 'ساخته شد');
    onSaved(d.data);
  };

  const f = (k: keyof typeof form, v: any) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-fg font-semibold">{isEdit ? 'ویرایش کد تخفیف' : 'کد تخفیف جدید'}</h2>
          <button onClick={onClose} className="text-subtle hover:text-fg cursor-pointer transition-colors"><XMarkIcon className="w-5 h-5" /></button>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs text-muted mb-1.5">کد تخفیف <span className="text-primary">*</span></label>
            <input value={form.code} onChange={e => f('code', e.target.value.toUpperCase())} className="admin-input" dir="ltr" placeholder="SUMMER20" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-muted mb-1.5">توضیحات</label>
            <input value={form.description} onChange={e => f('description', e.target.value)} className="admin-input" placeholder="تخفیف ویژه تابستان" />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5">نوع</label>
            <select value={form.type} onChange={e => f('type', e.target.value)} className="admin-input cursor-pointer">
              <option value="PERCENTAGE">درصدی (%)</option>
              <option value="FIXED">مبلغ ثابت (ریال)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5">مقدار <span className="text-primary">*</span></label>
            <input type="number" value={form.value} onChange={e => f('value', e.target.value)} className="admin-input" dir="ltr" placeholder={form.type === 'PERCENTAGE' ? '20' : '50000'} />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5">حداقل سفارش (ریال)</label>
            <input type="number" value={form.minOrder} onChange={e => f('minOrder', e.target.value)} className="admin-input" dir="ltr" />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5">حداکثر استفاده (0=نامحدود)</label>
            <input type="number" value={form.maxUses} onChange={e => f('maxUses', e.target.value)} className="admin-input" dir="ltr" />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5">تاریخ انقضا</label>
            <input type="date" value={form.expiresAt} onChange={e => f('expiresAt', e.target.value)} className="admin-input" dir="ltr" />
          </div>
          <div className="flex items-center gap-3 pt-4">
            <label className="text-xs text-muted">فعال</label>
            <button type="button" onClick={() => f('isActive', !form.isActive)}
              className={`w-10 h-5 rounded-full relative transition-all duration-300 cursor-pointer ${form.isActive ? 'bg-green-600' : 'bg-surface-3'}`}>
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${form.isActive ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
          <button onClick={onClose} className="btn btn-md btn-ghost">لغو</button>
          <button onClick={save} disabled={saving} className="btn btn-md btn-primary flex items-center gap-2">
            {saving && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {isEdit ? 'ذخیره' : 'ایجاد'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Discounts() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem]   = useState<Discount | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/discounts', { credentials: 'include' });
    const d   = await res.json();
    setDiscounts(d.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const handleDelete = async (id: string) => {
    if (!confirm('این کد تخفیف حذف شود؟')) return;
    const res = await fetch(`/api/admin/discounts?id=${id}`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) { setDiscounts(p => p.filter(d => d.id !== id)); toast.success('حذف شد'); }
    else toast.error('خطا در حذف');
  };

  const handleToggle = async (item: Discount) => {
    const res = await fetch(`/api/admin/discounts?id=${item.id}`, {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !item.isActive }),
    });
    const d = await res.json();
    if (res.ok) setDiscounts(p => p.map(x => x.id === item.id ? { ...x, isActive: !item.isActive } : x));
    else toast.error(d.error || 'خطا');
  };

  const handleSaved = (saved: Discount) => {
    setDiscounts(p => {
      const ex = p.find(x => x.id === saved.id);
      return ex ? p.map(x => x.id === saved.id ? saved : x) : [saved, ...p];
    });
    setShowCreate(false);
    setEditItem(null);
  };

  const isExpired = (d: Discount) => d.expiresAt ? new Date(d.expiresAt) < new Date() : false;

  return (
    <div className="min-h-screen bg-bg text-fg" dir="rtl">
      <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-5">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">کدهای تخفیف</h1>
            <p className="text-sm text-subtle mt-0.5">{fmt(discounts.length)} کد</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetch_} className="p-2 rounded-lg bg-surface-2 hover:bg-surface-3 text-muted cursor-pointer transition-all">
              <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => setShowCreate(true)} className="btn btn-md btn-primary flex items-center gap-2">
              <PlusIcon className="w-4 h-4" /> کد جدید
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'کل', value: discounts.length, color: 'text-fg' },
            { label: 'فعال', value: discounts.filter(d => d.isActive && !isExpired(d)).length, color: 'text-success' },
            { label: 'منقضی', value: discounts.filter(isExpired).length, color: 'text-error' },
            { label: 'غیرفعال', value: discounts.filter(d => !d.isActive).length, color: 'text-muted' },
          ].map(s => (
            <div key={s.label} className="bg-surface border border-border rounded-xl px-4 py-3">
              <p className="text-xs text-subtle">{s.label}</p>
              <p className={`text-xl font-bold mt-0.5 ${s.color}`}>{fmt(s.value)}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-2/60">
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted">کد</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted">نوع / مقدار</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted">استفاده</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted">انقضا</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted">وضعیت</th>
                  <th className="px-4 py-3 w-20" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loading
                  ? Array(3).fill(0).map((_,i) => <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-4 bg-surface-2 rounded animate-pulse" /></td></tr>)
                  : discounts.length === 0
                    ? <tr><td colSpan={6} className="py-14 text-center"><TagIcon className="w-10 h-10 mx-auto text-muted mb-2" /><p className="text-subtle text-sm">کد تخفیفی وجود ندارد</p></td></tr>
                    : discounts.map(d => {
                        const expired = isExpired(d);
                        return (
                          <tr key={d.id} className="hover:bg-surface-2/30 transition-colors group">
                            <td className="px-4 py-3">
                              <p className="font-mono text-primary font-semibold">{d.code}</p>
                              {d.description && <p className="text-subtle text-xs mt-0.5">{d.description}</p>}
                            </td>
                            <td className="px-4 py-3 text-muted">
                              {d.type === 'PERCENTAGE' ? `${fmt(d.value)}٪` : `${fmt(d.value)} ریال`}
                              {d.minOrder > 0 && <p className="text-subtle text-xs">حداقل: {fmt(d.minOrder)} ریال</p>}
                            </td>
                            <td className="px-4 py-3 text-muted text-sm tabular-nums">
                              {fmt(d.usedCount)} / {d.maxUses === 0 ? '∞' : fmt(d.maxUses)}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {d.expiresAt
                                ? <span className={expired ? 'text-error' : 'text-muted'}>{fmtD(d.expiresAt)}{expired && ' (منقضی)'}</span>
                                : <span className="text-subtle">نامحدود</span>
                              }
                            </td>
                            <td className="px-4 py-3">
                              <button onClick={() => handleToggle(d)}
                                className={`w-10 h-5 rounded-full relative transition-all duration-300 cursor-pointer ${d.isActive && !expired ? 'bg-green-600' : 'bg-surface-3'}`}>
                                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${d.isActive && !expired ? 'left-[22px]' : 'left-0.5'}`} />
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                                <button onClick={() => setEditItem(d)}
                                  className="p-1.5 rounded-lg hover:bg-surface-3 text-muted hover:text-primary cursor-pointer transition-colors">
                                  <PencilSquareIcon className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(d.id)}
                                  className="p-1.5 rounded-lg hover:bg-red-900/30 text-muted hover:text-error cursor-pointer transition-colors">
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {(showCreate || editItem) && (
        <DiscountModal
          discount={editItem}
          onClose={() => { setShowCreate(false); setEditItem(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
