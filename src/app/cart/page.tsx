'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TrashIcon, MinusIcon, PlusIcon, ShoppingBagIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { imageUrl } from '@/lib/imageUrl';

interface CartItem {
  id: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  price: number;
  product: { id: string; name: string; mainImage: string | null; totalStock: number };
  variant: { id: string; size: string | null; color: string | null } | null;
}

const fmt = (n: number) => new Intl.NumberFormat('fa-IR').format(n);

export default function CartPage() {
  const [items, setItems]     = useState<CartItem[]>([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchCart = async () => {
    const res = await fetch('/api/user/cart', { credentials: 'include' });
    if (res.status === 401) { router.push('/user/login'); return; }
    const data = await res.json();
    setItems(data.items || []);
    setTotal(data.total || 0);
    setLoading(false);
  };

  useEffect(() => { fetchCart(); }, []);

  const updateQty = async (itemId: string, qty: number) => {
    if (qty < 1) return remove(itemId);
    await fetch('/api/user/cart', {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, quantity: qty }),
    });
    fetchCart();
  };

  const remove = async (itemId: string) => {
    await fetch(`/api/user/cart?itemId=${itemId}`, { method: 'DELETE', credentials: 'include' });
    toast.success('از سبد حذف شد');
    fetchCart();
  };

  const shipping = total >= 500000 ? 0 : 35000;

  if (loading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-bg text-fg" dir="rtl">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/products" className="text-muted hover:text-fg transition-colors">
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold">سبد خرید</h1>
          {items.length > 0 && <span className="text-sm text-muted">({fmt(items.length)} آیتم)</span>}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-24">
            <ShoppingBagIcon className="w-16 h-16 mx-auto text-subtle mb-4" />
            <p className="text-muted mb-6">سبد خرید شما خالی است</p>
            <Link href="/products" className="px-6 py-3 bg-primary hover:bg-primary-hover text-primary-fg rounded-xl text-sm font-medium transition-colors cursor-pointer">
              مشاهده محصولات
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Items */}
            <div className="lg:col-span-2 space-y-3">
              {items.map(item => (
                <div key={item.id} className="bg-surface border border-border rounded-2xl p-4 flex gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-surface-2 flex-shrink-0">
                    {item.product.mainImage
                      ? <img src={imageUrl(item.product.mainImage)} alt={item.product.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-subtle text-xs">تصویر</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-fg font-medium text-sm">{item.product.name}</p>
                    {item.variant && (
                      <p className="text-muted text-xs mt-0.5">
                        {[item.variant.size, item.variant.color].filter(Boolean).join(' / ')}
                      </p>
                    )}
                    <p className="text-primary font-bold mt-1 text-sm">{fmt(item.price)} ریال</p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button onClick={() => remove(item.id)} className="text-subtle hover:text-red-400 cursor-pointer transition-colors">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2 bg-surface-2 rounded-xl px-2 py-1">
                      <button onClick={() => updateQty(item.id, item.quantity - 1)} className="text-muted hover:text-fg cursor-pointer transition-colors">
                        <MinusIcon className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-fg text-sm w-6 text-center tabular-nums">{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, item.quantity + 1)} className="text-muted hover:text-fg cursor-pointer transition-colors">
                        <PlusIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-surface border border-border rounded-2xl p-5 h-fit space-y-4">
              <h2 className="text-fg font-semibold">خلاصه سفارش</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted">
                  <span>جمع کل</span>
                  <span>{fmt(total)} ریال</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>هزینه ارسال</span>
                  <span>{shipping === 0 ? <span className="text-success">رایگان</span> : `${fmt(shipping)} ریال`}</span>
                </div>
                {shipping === 0 && <p className="text-xs text-success/70">ارسال رایگان برای خریدهای بالای ۵۰۰,۰۰۰ ریال</p>}
                <div className="border-t border-border pt-2 flex justify-between text-fg font-semibold">
                  <span>مبلغ نهایی</span>
                  <span>{fmt(total + shipping)} ریال</span>
                </div>
              </div>
              <Link href="/checkout"
                className="block w-full text-center py-3 bg-primary hover:bg-primary-hover text-primary-fg rounded-xl font-semibold text-sm transition-colors cursor-pointer">
                ادامه و ثبت سفارش
              </Link>
              <Link href="/products" className="block text-center text-sm text-muted hover:text-fg transition-colors cursor-pointer">
                ادامه خرید
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
