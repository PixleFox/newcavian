'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { getProducts, deleteProduct } from '@/services/productService';
import { Product } from '@/types/product';
import {
  PlusIcon, MagnifyingGlassIcon, FunnelIcon,
  Squares2X2Icon, TableCellsIcon, PencilSquareIcon,
  TrashIcon, ArrowPathIcon,
  TagIcon, ArchiveBoxIcon, CheckCircleIcon,
} from '@heroicons/react/24/outline';
import ProductFormModal from './ProductFormModal';

// ─── Inline Stock Editor ───────────────────────────────────────────────────

function StockEditor({ productId, initialStock, onUpdated }: {
  productId: string; initialStock: number; onUpdated: (n: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(initialStock);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const save = async (newVal: number) => {
    if (newVal === initialStock) { setEditing(false); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/products/stock', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, stock: newVal }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('موجودی بروز شد');
        onUpdated(newVal);
        setEditing(false);
      } else {
        toast.error(data.error || 'خطا');
        setVal(initialStock);
      }
    } catch {
      toast.error('خطای اتصال');
      setVal(initialStock);
    } finally {
      setSaving(false);
    }
  };

  const adjust = (delta: number) => {
    const next = Math.max(0, val + delta);
    setVal(next);
    save(next);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <button onClick={() => adjust(-1)} disabled={saving || val === 0}
          className="w-6 h-6 rounded bg-gray-700 hover:bg-gray-600 text-white text-sm flex items-center justify-center cursor-pointer disabled:opacity-40 transition-colors">−</button>
        <input
          ref={inputRef}
          type="number" min="0" value={val}
          onChange={e => setVal(Math.max(0, parseInt(e.target.value) || 0))}
          onBlur={() => save(val)}
          onKeyDown={e => { if (e.key === 'Enter') save(val); if (e.key === 'Escape') { setVal(initialStock); setEditing(false); } }}
          className="w-14 text-center bg-gray-800 border border-purple-600 text-white text-sm rounded px-1 py-0.5 focus:outline-none tabular-nums"
          autoFocus
        />
        <button onClick={() => adjust(1)} disabled={saving}
          className="w-6 h-6 rounded bg-gray-700 hover:bg-gray-600 text-white text-sm flex items-center justify-center cursor-pointer transition-colors">+</button>
        {saving && <div className="w-3 h-3 border border-purple-500 border-t-transparent rounded-full animate-spin" />}
      </div>
    );
  }

  return (
    <button onClick={() => { setVal(initialStock); setEditing(true); }}
      className={`font-medium tabular-nums cursor-pointer hover:underline underline-offset-2 transition-colors ${
        initialStock === 0 ? 'text-orange-400' : initialStock < 10 ? 'text-yellow-400' : 'text-gray-300'
      }`}
      title="کلیک کنید تا ویرایش کنید"
    >
      {initialStock}
    </button>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────

function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl px-5 py-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-800/50">
      {[1,2,3,4,5,6].map(i => (
        <td key={i} className="px-4 py-3.5">
          <div className="h-4 bg-gray-800 rounded animate-pulse" style={{ width: `${[60,40,30,30,25,20][i-1]}%` }} />
        </td>
      ))}
    </tr>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-800" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-700 rounded w-3/4" />
        <div className="h-3 bg-gray-800 rounded w-1/2" />
        <div className="h-4 bg-gray-700 rounded w-1/3 mt-2" />
      </div>
    </div>
  );
}

function StatusBadge({ isActive, status }: { isActive: boolean; status?: string }) {
  if (status === 'archived' || (!isActive && status !== 'draft'))
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-800 text-gray-400 border border-gray-700"><ArchiveBoxIcon className="w-3 h-3"/>آرشیو</span>;
  if (isActive)
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-950 text-green-400 border border-green-900"><CheckCircleIcon className="w-3 h-3"/>فعال</span>;
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-yellow-950 text-yellow-400 border border-yellow-900"><TagIcon className="w-3 h-3"/>پیش‌نویس</span>;
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="py-20 flex flex-col items-center justify-center text-center">
      <div className="w-20 h-20 rounded-2xl bg-gray-800 flex items-center justify-center mb-5">
        <Squares2X2Icon className="w-10 h-10 text-gray-600" />
      </div>
      <p className="text-white font-semibold text-lg mb-1">هنوز محصولی ندارید</p>
      <p className="text-gray-500 text-sm mb-6 max-w-xs">اولین محصول خود را اضافه کنید تا در فروشگاه نمایش داده شود</p>
      <button onClick={onAdd} className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer">
        <PlusIcon className="w-4 h-4" /> افزودن اولین محصول
      </button>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function Products() {
  const [products, setProducts]   = useState<Product[]>([]);
  const [loading, setLoading]     = useState(true);
  const [view, setView]           = useState<'table' | 'grid'>('table');
  const [selected, setSelected]   = useState<string[]>([]);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEdit]    = useState<any>(null);
  const [pagination, setPag]      = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [stats, setStats]         = useState({ total: 0, active: 0, draft: 0, archived: 0 });

  const fetch_ = useCallback(async (page = pagination.page) => {
    setLoading(true);
    try {
      const res = await getProducts({ page, limit: pagination.limit, search, status: statusFilter });
      setProducts(res.data);
      const pg = res.pagination;
      setPag(p => ({ ...p, page, total: pg.total, totalPages: pg.totalPages }));

      // compute stats from response (rough — ideally a stats endpoint)
      const active   = res.data.filter(p => p.isActive).length;
      const archived = res.data.filter(p => (p as any).status === 'archived').length;
      setStats({ total: pg.total, active, draft: res.data.length - active - archived, archived });
    } catch {
      toast.error('خطا در دریافت محصولات');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, statusFilter]);

  useEffect(() => { fetch_(1); }, [search, statusFilter]);

  // ── selection helpers
  const toggleAll = (on: boolean) => setSelected(on ? products.map(p => p.id) : []);
  const toggleOne = (id: string) =>
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  // ── actions
  const handleDelete = async (id: string) => {
    if (!confirm('محصول حذف شود؟')) return;
    try { await deleteProduct(id); toast.success('حذف شد'); fetch_(pagination.page); }
    catch { toast.error('خطا در حذف'); }
  };

  const updateStock = (id: string, newStock: number) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, totalStock: newStock } : p));
  };

  const handleBulkDelete = async () => {
    if (!confirm(`${selected.length} محصول حذف شود؟`)) return;
    await Promise.all(selected.map(id => deleteProduct(id).catch(() => {})));
    toast.success(`${selected.length} محصول حذف شد`);
    setSelected([]);
    fetch_(1);
  };

  const openAdd  = () => { setEdit(null);    setShowModal(true); };
  const openEdit = (p: any) => { setEdit(p); setShowModal(true); };

  const fmt = (n: number) => new Intl.NumberFormat('fa-IR').format(n);
  const getCat = (p: Product) =>
    typeof p.category === 'object' && p.category ? (p.category as any).name : (p.category || '—');

  // ── render ----------------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white" dir="rtl">
      <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-5">

        {/* ── Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">مدیریت محصولات</h1>
            <p className="text-sm text-gray-500 mt-0.5">مشاهده، ویرایش و افزودن محصولات فروشگاه</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetch_(pagination.page)}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all cursor-pointer"
              title="بارگذاری مجدد"
            >
              <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer shadow-lg shadow-purple-900/30"
            >
              <PlusIcon className="w-4 h-4" /> افزودن محصول
            </button>
          </div>
        </div>

        {/* ── Stats */}
        <div className="grid grid-cols-4 gap-3">
          <StatCard label="کل محصولات" value={fmt(stats.total)} color="text-white" />
          <StatCard label="فعال"         value={fmt(stats.active)} color="text-green-400" />
          <StatCard label="پیش‌نویس"    value={fmt(stats.draft)}  color="text-yellow-400" />
          <StatCard label="آرشیو"        value={fmt(stats.archived)} color="text-gray-400" />
        </div>

        {/* ── Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* search */}
          <div className="relative flex-1 min-w-52">
            <MagnifyingGlassIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="جستجو در نام محصول..."
              className="w-full bg-[#111827] border border-gray-800 text-white placeholder-gray-600 rounded-xl pr-9 pl-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-600 focus:border-purple-600 outline-none transition-all"
            />
          </div>

          {/* status filter */}
          <div className="relative">
            <FunnelIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <select
              value={statusFilter} onChange={e => setStatus(e.target.value)}
              className="bg-[#111827] border border-gray-800 text-sm text-gray-300 rounded-xl pr-9 pl-4 py-2.5 focus:ring-2 focus:ring-purple-600 outline-none cursor-pointer appearance-none"
            >
              <option value="">همه وضعیت‌ها</option>
              <option value="active">فعال</option>
              <option value="draft">پیش‌نویس</option>
              <option value="archived">آرشیو</option>
            </select>
          </div>

          {/* view toggle */}
          <div className="flex bg-[#111827] border border-gray-800 rounded-xl p-1 gap-1">
            {(['table', 'grid'] as const).map(v => (
              <button
                key={v} onClick={() => setView(v)}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${view === v ? 'bg-purple-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                {v === 'table' ? <TableCellsIcon className="w-4 h-4" /> : <Squares2X2Icon className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>

        {/* ── Bulk action bar */}
        {selected.length > 0 && (
          <div className="flex items-center justify-between bg-purple-950/60 border border-purple-800/40 rounded-xl px-4 py-2.5">
            <span className="text-sm text-purple-300">{selected.length} محصول انتخاب شده</span>
            <div className="flex gap-2">
              <button onClick={() => setSelected([])} className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors">لغو</button>
              <button onClick={handleBulkDelete} className="text-xs text-red-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-red-900/40 cursor-pointer transition-colors flex items-center gap-1">
                <TrashIcon className="w-3.5 h-3.5" /> حذف انتخاب‌شده
              </button>
            </div>
          </div>
        )}

        {/* ── Content */}
        {loading ? (
          view === 'table' ? (
            <div className="bg-[#111827] border border-gray-800 rounded-2xl overflow-hidden">
              <table className="w-full"><tbody>{Array(8).fill(0).map((_, i) => <SkeletonRow key={i} />)}</tbody></table>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array(10).fill(0).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )
        ) : products.length === 0 ? (
          <div className="bg-[#111827] border border-gray-800 rounded-2xl">
            <EmptyState onAdd={openAdd} />
          </div>
        ) : view === 'table' ? (

          /* ── TABLE VIEW */
          <div className="bg-[#111827] border border-gray-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-900/60">
                    <th className="px-4 py-3 text-right w-10">
                      <input type="checkbox" className="rounded border-gray-700 bg-gray-800 accent-purple-500"
                        checked={selected.length === products.length && products.length > 0}
                        onChange={e => toggleAll(e.target.checked)} />
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">محصول</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">دسته‌بندی</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">قیمت</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">موجودی</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">وضعیت</th>
                    <th className="px-4 py-3 w-16" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {products.map(p => (
                    <tr key={p.id} className={`group hover:bg-gray-800/40 transition-colors ${selected.includes(p.id) ? 'bg-purple-950/20' : ''}`}>
                      <td className="px-4 py-3.5">
                        <input type="checkbox" className="rounded border-gray-700 bg-gray-800 accent-purple-500"
                          checked={selected.includes(p.id)} onChange={() => toggleOne(p.id)} />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-800 overflow-hidden flex-shrink-0 border border-gray-700/50">
                            {(p.mainImage || (p.images && p.images[0])) ? (
                              <img src={p.mainImage || p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-600">
                                <Squares2X2Icon className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-white text-sm leading-tight">{p.name}</p>
                            {p.isFeatured && <span className="text-xs text-purple-400">ویژه</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-gray-400 text-xs">{getCat(p)}</td>
                      <td className="px-4 py-3.5">
                        <span className="text-white font-medium tabular-nums">{fmt(p.price)}</span>
                        <span className="text-gray-500 text-xs mr-1">ت</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <StockEditor productId={p.id} initialStock={p.totalStock} onUpdated={n => updateStock(p.id, n)} />
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge isActive={p.isActive} status={p.status} />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                          <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-purple-400 cursor-pointer transition-colors" title="ویرایش">
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-red-900/30 text-gray-400 hover:text-red-400 cursor-pointer transition-colors" title="حذف">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        ) : (

          /* ── GRID VIEW */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map(p => (
              <div
                key={p.id}
                className={`group relative bg-[#111827] border rounded-xl overflow-hidden transition-all cursor-pointer ${
                  selected.includes(p.id) ? 'border-purple-500 shadow-lg shadow-purple-900/20' : 'border-gray-800 hover:border-gray-700'
                }`}
                onClick={() => toggleOne(p.id)}
              >
                {/* image */}
                <div className="aspect-square bg-gray-800 relative overflow-hidden">
                  {(p.mainImage || (p.images && p.images[0])) ? (
                    <img src={p.mainImage || p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700">
                      <Squares2X2Icon className="w-10 h-10" />
                    </div>
                  )}
                  {/* overlay actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={e => { e.stopPropagation(); openEdit(p); }}
                      className="p-2 rounded-lg bg-white/10 hover:bg-purple-600 text-white cursor-pointer transition-colors backdrop-blur-sm">
                      <PencilSquareIcon className="w-4 h-4" />
                    </button>
                    <button onClick={e => { e.stopPropagation(); handleDelete(p.id); }}
                      className="p-2 rounded-lg bg-white/10 hover:bg-red-600 text-white cursor-pointer transition-colors backdrop-blur-sm">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                  {/* selected check */}
                  {selected.includes(p.id) && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
                    </div>
                  )}
                  {/* badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {p.isNew && <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded font-medium">جدید</span>}
                    {p.isFeatured && <span className="text-xs bg-purple-600 text-white px-1.5 py-0.5 rounded font-medium">ویژه</span>}
                  </div>
                </div>

                {/* info */}
                <div className="p-3">
                  <p className="text-sm font-medium text-white leading-tight mb-1 line-clamp-1">{p.name}</p>
                  <p className="text-xs text-gray-500 mb-2">{getCat(p)}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white tabular-nums">{fmt(p.price)}<span className="text-xs text-gray-500 font-normal mr-0.5">ت</span></span>
                    <StatusBadge isActive={p.isActive} status={p.status} />
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-800 flex items-center justify-between">
                    <span className="text-xs text-gray-500">موجودی:</span>
                    <StockEditor productId={p.id} initialStock={p.totalStock} onUpdated={n => updateStock(p.id, n)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between py-2">
            <p className="text-xs text-gray-500">
              نمایش {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} از <span className="text-gray-300 font-medium">{fmt(pagination.total)}</span> محصول
            </p>
            <div className="flex gap-1">
              <button disabled={pagination.page === 1} onClick={() => fetch_(pagination.page - 1)}
                className="px-3 py-1.5 text-sm rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors">
                ‹ قبلی
              </button>
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const tp = pagination.totalPages;
                let pg = i + 1;
                if (tp > 5) {
                  if (pagination.page <= 3) pg = i + 1;
                  else if (pagination.page >= tp - 2) pg = tp - 4 + i;
                  else pg = pagination.page - 2 + i;
                }
                return (
                  <button key={pg} onClick={() => fetch_(pg)}
                    className={`w-9 py-1.5 text-sm rounded-lg cursor-pointer transition-colors ${pagination.page === pg ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
                    {pg}
                  </button>
                );
              })}
              <button disabled={pagination.page === pagination.totalPages} onClick={() => fetch_(pagination.page + 1)}
                className="px-3 py-1.5 text-sm rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors">
                بعدی ›
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal */}
      {showModal && (
        <ProductFormModal
          product={editProduct}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); fetch_(pagination.page); }}
        />
      )}
    </div>
  );
}
