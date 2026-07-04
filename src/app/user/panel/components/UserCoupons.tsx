'use client';
import { useEffect, useState } from 'react';
import { ClipboardDocumentIcon, CheckIcon, TagIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const fmt = (n: number) => new Intl.NumberFormat('fa-IR').format(n);
const fmtDate = (d: string) => new Date(d).toLocaleDateString('fa-IR');

export default function UserCoupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied]   = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/user/coupons', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setCoupons(d.data || []))
      .finally(() => setLoading(false));
  }, []);

  const copy = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(code);
      toast.success('کد کپی شد');
      setTimeout(() => setCopied(null), 2000);
    });
  };

  if (loading) return <div className="flex items-center justify-center h-40"><div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div dir="rtl" className="space-y-4">
      <h2 className="text-lg font-semibold text-white">کدهای تخفیف</h2>

      {coupons.length === 0 ? (
        <div className="bg-[#111827] border border-gray-800 rounded-2xl flex flex-col items-center justify-center py-16 gap-3">
          <TagIcon className="w-10 h-10 text-gray-700" />
          <p className="text-gray-500 text-sm">کد تخفیف فعالی وجود ندارد</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {coupons.map((c: any) => (
            <div key={c.id} className="bg-[#111827] border border-gray-800 rounded-2xl px-5 py-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-white font-semibold text-sm">{c.description || 'کد تخفیف'}</p>
                  {c.expiresAt && <p className="text-gray-500 text-xs mt-0.5">انقضا: {fmtDate(c.expiresAt)}</p>}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs flex-shrink-0 ${c.type === 'PERCENTAGE' ? 'bg-purple-900/40 text-purple-300' : 'bg-green-900/40 text-green-300'}`}>
                  {c.type === 'PERCENTAGE' ? `${c.value}٪` : `${fmt(Number(c.value))} ریال`}
                </span>
              </div>

              {c.minOrder > 0 && <p className="text-gray-600 text-xs mb-3">حداقل خرید: {fmt(Number(c.minOrder))} ریال</p>}

              <div className="flex items-center gap-2 bg-[#0a0f1e] border border-gray-800 rounded-xl px-3 py-2">
                <span className="font-mono text-purple-300 text-sm tracking-widest flex-1" dir="ltr">{c.code}</span>
                <button onClick={() => copy(c.code)} className="text-gray-500 hover:text-purple-400 transition-colors">
                  {copied === c.code ? <CheckIcon className="w-4 h-4 text-green-400" /> : <ClipboardDocumentIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
