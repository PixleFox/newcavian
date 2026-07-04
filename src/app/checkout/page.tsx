'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircleIcon, ArrowRightIcon, TruckIcon, TagIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { imageUrl } from '@/lib/imageUrl';

interface CartItem {
  id: string; productId: string;
  quantity: number; price: number;
  product: { name: string; mainImage: string | null };
  variant: { size: string | null; color: string | null } | null;
}

const fmt = (n: number) => new Intl.NumberFormat('fa-IR').format(n);
const inp = 'w-full bg-surface-2 border border-border text-fg placeholder:text-subtle rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all';

export default function CheckoutPage() {
  const [items, setItems]     = useState<CartItem[]>([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing]   = useState(false);
  const [done, setDone]         = useState<string | null>(null);
  const [form, setForm]         = useState({ fullName: '', phone: '', address: '', city: '', postalCode: '' });
  const [coupon, setCoupon]     = useState('');
  const [discount, setDiscount] = useState(0);
  const [checking, setChecking] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/user/cart', { credentials: 'include' })
      .then(r => { if (r.status === 401) { toast.error('برای ادامه ابتدا وارد حساب کاربری شوید'); router.push('/user/login'); } return r.json(); })
      .then(d => { setItems(d.items || []); setTotal(d.total || 0); setLoading(false); });

    fetch('/api/user/auth/me', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.authenticated) setForm(f => ({ ...f, phone: d.data.phone || '', fullName: d.data.fullName || '' })); });
  }, []);

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    setChecking(true);
    const res = await fetch('/api/user/coupon', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: coupon, total }),
    });
    const d = await res.json();
    setChecking(false);
    if (!res.ok) { toast.error(d.error || 'کد تخفیف نامعتبر است'); setDiscount(0); return; }
    setDiscount(d.discount);
    toast.success(`${fmt(d.discount)} ریال تخفیف اعمال شد`);
  };

  const place = async () => {
    if (!form.fullName || !form.phone || !form.address || !form.city || !form.postalCode) {
      toast.error('همه فیلدها را پر کنید'); return;
    }
    setPlacing(true);
    try {
      const res  = await fetch('/api/user/checkout', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, couponCode: coupon, discountAmount: discount }) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'خطا'); return; }
      setDone(data.orderNumber);
    } catch { toast.error('خطای اتصال'); }
    finally { setPlacing(false); }
  };

  const shipping = total >= 500000 ? 0 : 35000;

  if (loading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (done) return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4" dir="rtl">
      <div className="bg-surface border border-border rounded-2xl p-8 max-w-md w-full text-center space-y-4">
        <CheckCircleIcon className="w-16 h-16 text-success mx-auto" />
        <h1 className="text-xl font-bold text-fg">سفارش با موفقیت ثبت شد!</h1>
        <p className="text-muted text-sm">شماره سفارش شما:</p>
        <p className="text-primary font-mono font-bold text-lg bg-primary/10 rounded-xl py-2 px-4">{done}</p>
        <p className="text-muted text-xs">پس از بررسی توسط ادمین، وضعیت سفارش به‌روز می‌شود.</p>
        <div className="flex gap-3 justify-center pt-2">
          <Link href="/user/panel" className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-primary-fg rounded-xl text-sm font-medium transition-colors cursor-pointer">
            پیگیری سفارش
          </Link>
          <Link href="/products" className="px-5 py-2.5 border border-border hover:border-border-strong text-muted hover:text-fg rounded-xl text-sm transition-colors cursor-pointer">
            ادامه خرید
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg text-fg" dir="rtl">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/cart" className="text-muted hover:text-fg transition-colors">
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold">تکمیل سفارش</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-surface border border-border rounded-2xl p-6">
              <h2 className="text-fg font-semibold mb-4 flex items-center gap-2">
                <TruckIcon className="w-5 h-5 text-primary" /> اطلاعات تحویل
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-muted mb-1.5">نام و نام خانوادگی <span className="text-primary">*</span></label>
                  <input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} className={inp} placeholder="علی احمدی" />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1.5">شماره موبایل <span className="text-primary">*</span></label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inp} dir="ltr" placeholder="09123456789" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-muted mb-1.5">آدرس <span className="text-primary">*</span></label>
                  <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className={inp} placeholder="خیابان، کوچه، پلاک" />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1.5">شهر <span className="text-primary">*</span></label>
                  <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className={inp} placeholder="تهران" />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1.5">کد پستی <span className="text-primary">*</span></label>
                  <input value={form.postalCode} onChange={e => setForm(f => ({ ...f, postalCode: e.target.value }))} className={inp} dir="ltr" placeholder="1234567890" />
                </div>
              </div>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-6">
              <h2 className="text-fg font-semibold mb-4">روش پرداخت</h2>
              <div className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/30 rounded-xl">
                <div className="w-4 h-4 rounded-full bg-primary flex-shrink-0" />
                <span className="text-sm text-fg">پرداخت در محل (پیک)</span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <div className="bg-surface border border-border rounded-2xl p-5">
              <h2 className="text-fg font-semibold mb-4">سفارش شما ({fmt(items.length)} آیتم)</h2>
              <div className="space-y-3 mb-4 max-h-52 overflow-y-auto">
                {items.map(i => (
                  <div key={i.id} className="flex items-center gap-2 text-sm">
                    <div className="w-10 h-10 rounded-lg bg-surface-2 overflow-hidden flex-shrink-0">
                      {i.product.mainImage && <img src={imageUrl(i.product.mainImage)} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-fg text-xs truncate">{i.product.name}</p>
                      {i.variant && <p className="text-subtle text-xs">{[i.variant.size, i.variant.color].filter(Boolean).join('/')}</p>}
                    </div>
                    <p className="text-muted text-xs flex-shrink-0">×{i.quantity}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-muted">
                  <span>جمع</span><span>{fmt(total)} ریال</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>ارسال</span>
                  <span>{shipping === 0 ? <span className="text-success">رایگان</span> : `${fmt(shipping)} ریال`}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>تخفیف</span><span>-{fmt(discount)} ریال</span>
                  </div>
                )}
                <div className="flex justify-between text-fg font-bold border-t border-border pt-2">
                  <span>مبلغ نهایی</span><span>{fmt(total + shipping - discount)} ریال</span>
                </div>
                <div className="flex gap-2 pt-1">
                  <input value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())}
                    placeholder="کد تخفیف" dir="ltr"
                    className="flex-1 bg-surface-2 border border-border text-fg placeholder:text-subtle rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-primary outline-none" />
                  <button onClick={applyCoupon} disabled={checking || !coupon.trim()}
                    className="px-3 py-2 bg-surface-2 hover:bg-surface-2/70 disabled:opacity-50 text-fg rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors">
                    <TagIcon className="w-3.5 h-3.5" />{checking ? '...' : 'اعمال'}
                  </button>
                </div>
              </div>
            </div>

            <button onClick={place} disabled={placing || items.length === 0}
              className="w-full py-3.5 bg-primary hover:bg-primary-hover disabled:opacity-60 text-fg rounded-xl font-semibold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2">
              {placing && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              ثبت سفارش
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
