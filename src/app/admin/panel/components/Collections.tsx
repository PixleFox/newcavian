'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';

interface Product { id: string; name: string; mainImage: string | null; }
interface Collection {
  id: string; name: string; slug: string; description?: string;
  image?: string; isActive: boolean; sortOrder: number;
  products: { product: Product }[];
}

const slugify = (s: string) => {
  const latin = s.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return latin || `col-${Date.now()}`;
};

export default function Collections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [allProducts, setAllProducts]   = useState<Product[]>([]);
  const [loading, setLoading]           = useState(true);
  const [modal, setModal]               = useState<'create' | Collection | null>(null);
  const [form, setForm]                 = useState({ name: '', slug: '', description: '', isActive: true, sortOrder: 0 });
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [saving, setSaving]             = useState(false);
  const [err, setErr]                   = useState('');

  const load = async () => {
    const [c, p] = await Promise.all([
      fetch('/api/admin/collections', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/admin/products?limit=200', { credentials: 'include' }).then(r => r.json()),
    ]);
    setCollections(Array.isArray(c) ? c : []);
    setAllProducts(Array.isArray(p?.products) ? p.products : Array.isArray(p) ? p : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm({ name: '', slug: '', description: '', isActive: true, sortOrder: 0 });
    setSelectedProductIds([]);
    setErr('');
    setModal('create');
  };

  const openEdit = (c: Collection) => {
    setForm({ name: c.name, slug: c.slug, description: c.description || '', isActive: c.isActive, sortOrder: c.sortOrder });
    setSelectedProductIds(c.products.map(pc => pc.product.id));
    setErr('');
    setModal(c);
  };

  const save = async () => {
    if (!form.name.trim()) { setErr('نام الزامی است'); return; }
    const slug = form.slug || slugify(form.name);
    setSaving(true);
    setErr('');
    try {
      if (modal === 'create') {
        const res = await fetch('/api/admin/collections', {
          method: 'POST', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, slug }),
        });
        const created = await res.json();
        if (created?.id && selectedProductIds.length > 0) {
          await fetch(`/api/admin/collections/${created.id}`, {
            method: 'PATCH', credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productIds: selectedProductIds }),
          });
        }
      } else {
        const c = modal as Collection;
        await fetch(`/api/admin/collections/${c.id}`, {
          method: 'PATCH', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, slug, productIds: selectedProductIds }),
        });
      }
      setModal(null);
      load();
    } catch { setErr('خطای سرور'); }
    finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm('حذف این کالکشن؟')) return;
    await fetch(`/api/admin/collections/${id}`, { method: 'DELETE', credentials: 'include' });
    load();
  };

  const toggleProduct = (id: string) =>
    setSelectedProductIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  if (loading) return <div className="p-8 text-center text-gray-400">در حال بارگذاری...</div>;

  return (
    <div className="p-6" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-fg">کالکشن‌ها</h2>
        <button onClick={openCreate}
          className="btn btn-sm btn-primary">
          <PlusIcon className="w-4 h-4" /> کالکشن جدید
        </button>
      </div>

      {collections.length === 0 ? (
        <div className="text-center py-16 text-subtle">
          <p className="mb-4">هنوز کالکشنی وجود ندارد</p>
          <button onClick={openCreate} className="btn btn-md btn-primary">اولین کالکشن را بساز</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map(c => (
            <div key={c.id} className="card p-5 card-hover">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-fg">{c.name}</h3>
                  <p className="text-xs text-subtle mt-0.5">/{c.slug}</p>
                </div>
                <span className={`badge ${c.isActive ? 'badge-success' : 'badge-neutral'}`}>
                  {c.isActive ? 'فعال' : 'غیرفعال'}
                </span>
              </div>
              {c.description && <p className="text-muted text-xs mb-3 line-clamp-2">{c.description}</p>}
              <p className="text-xs text-subtle mb-4">{c.products.length} محصول</p>
              <div className="flex gap-2">
                <button onClick={() => openEdit(c)} className="btn btn-sm btn-outline flex-1">
                  <PencilIcon className="w-3.5 h-3.5" /> ویرایش
                </button>
                <button onClick={() => remove(c.id)} className="btn btn-sm btn-danger px-3">
                  <TrashIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-bold text-fg">{modal === 'create' ? 'کالکشن جدید' : `ویرایش: ${(modal as Collection).name}`}</h3>
              <button onClick={() => setModal(null)} className="btn btn-sm btn-ghost p-1.5"><XMarkIcon className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-caption text-muted mb-1.5">نام کالکشن *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))}
                    className="admin-input" />
                </div>
                <div>
                  <label className="block text-caption text-muted mb-1.5">slug (آدرس)</label>
                  <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                    dir="ltr" className="admin-input" />
                </div>
              </div>
              <div>
                <label className="block text-caption text-muted mb-1.5">توضیحات</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={2} className="admin-input resize-none" style={{ height: 'auto', paddingTop: 10, paddingBottom: 10 }} />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                    className="w-4 h-4 rounded accent-[var(--primary)]" />
                  <span className="text-sm text-fg">فعال</span>
                </label>
                <div className="flex items-center gap-2">
                  <label className="text-caption text-muted">ترتیب:</label>
                  <input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: +e.target.value }))}
                    className="admin-input w-16 text-center" style={{ height: 36 }} />
                </div>
              </div>

              {/* Product selector */}
              <div>
                <label className="block text-caption text-muted mb-2">محصولات این کالکشن ({selectedProductIds.length} انتخاب‌شده)</label>
                <div className="bg-surface-2 border border-border rounded-[14px] p-3 max-h-48 overflow-y-auto space-y-1">
                  {allProducts.length === 0 && <p className="text-caption text-subtle text-center py-2">محصولی یافت نشد</p>}
                  {allProducts.map(p => (
                    <label key={p.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-[10px] hover:bg-surface-3 cursor-pointer transition-colors">
                      <div className={`w-4 h-4 rounded-[4px] flex items-center justify-center flex-shrink-0 transition-colors ${selectedProductIds.includes(p.id) ? 'bg-primary' : 'border border-border-strong'}`}>
                        {selectedProductIds.includes(p.id) && <CheckIcon className="w-3 h-3 text-primary-fg" />}
                      </div>
                      <input type="checkbox" className="hidden" checked={selectedProductIds.includes(p.id)} onChange={() => toggleProduct(p.id)} />
                      <span className="text-sm text-fg truncate">{p.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {err && <p className="text-error text-xs">{err}</p>}

              <div className="flex gap-3 pt-2">
                <button onClick={save} disabled={saving} className="btn btn-md btn-primary flex-1">
                  {saving ? 'در حال ذخیره...' : 'ذخیره'}
                </button>
                <button onClick={() => setModal(null)} className="btn btn-md btn-ghost px-5">لغو</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
