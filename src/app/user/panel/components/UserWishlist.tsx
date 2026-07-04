'use client';
import { useEffect, useState } from 'react';
import { HeartIcon, TrashIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import toast from 'react-hot-toast';

const fmt = (n: number) => new Intl.NumberFormat('fa-IR').format(n);

export default function UserWishlist() {
  const [items, setItems]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/wishlist', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setItems(d.data || []))
      .finally(() => setLoading(false));
  }, []);

  const remove = async (productId: string) => {
    await fetch(`/api/user/wishlist?productId=${productId}`, { method: 'DELETE', credentials: 'include' });
    setItems(p => p.filter(i => i.productId !== productId));
    toast.success('از علاقه‌مندی‌ها حذف شد');
  };

  const addToCart = async (productId: string) => {
    const r = await fetch('/api/user/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ productId, quantity: 1 }),
    });
    const d = await r.json();
    if (d.success) toast.success('به سبد اضافه شد');
    else toast.error(d.error || 'خطا');
  };

  if (loading) return <div className="flex items-center justify-center h-40"><div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div dir="rtl" className="space-y-4">
      <div className="flex items-center gap-2">
        <HeartIcon className="w-5 h-5 text-pink-400" />
        <h2 className="text-lg font-semibold text-white">علاقه‌مندی‌ها</h2>
        <span className="text-xs text-gray-600">({items.length} مورد)</span>
      </div>

      {items.length === 0 ? (
        <div className="bg-[#111827] border border-gray-800 rounded-2xl flex flex-col items-center justify-center py-16 gap-3">
          <HeartIcon className="w-10 h-10 text-gray-700" />
          <p className="text-gray-500 text-sm">لیست علاقه‌مندی‌ها خالی است</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(item => {
            const p = item.Product;
            if (!p) return null;
            return (
              <div key={item.id} className="bg-[#111827] border border-gray-800 rounded-2xl overflow-hidden group">
                <div className="relative h-40 bg-gray-900">
                  {p.mainImage
                    ? <Image src={p.mainImage} alt={p.name} fill className="object-cover" />
                    : <div className="absolute inset-0 flex items-center justify-center text-gray-700 text-xs">بدون تصویر</div>
                  }
                  <button
                    onClick={() => remove(item.productId)}
                    className="absolute top-2 left-2 bg-black/60 hover:bg-red-900/60 text-gray-400 hover:text-red-400 rounded-full p-1.5 transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
                <div className="px-4 py-3">
                  <p className="text-white text-sm font-medium line-clamp-2 mb-2">{p.name}</p>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-purple-400 text-sm font-semibold">{fmt(Number(p.price))} ریال</p>
                      {p.compareAtPrice && Number(p.compareAtPrice) > Number(p.price) && (
                        <p className="text-gray-600 text-xs line-through">{fmt(Number(p.compareAtPrice))}</p>
                      )}
                    </div>
                    <button
                      onClick={() => addToCart(item.productId)}
                      disabled={!p.totalStock}
                      className="flex items-center gap-1.5 bg-purple-700 hover:bg-purple-600 disabled:opacity-40 text-white text-xs rounded-lg px-3 py-1.5 transition-colors"
                    >
                      <ShoppingCartIcon className="w-3.5 h-3.5" />
                      {p.totalStock ? 'افزودن' : 'ناموجود'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
