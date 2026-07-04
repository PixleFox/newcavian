'use client';
import { useEffect, useState } from 'react';
import { UserIcon, EnvelopeIcon, PhoneIcon, MapPinIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const FIELDS = [
  { key: 'fullName',   label: 'نام کامل',      icon: UserIcon,     type: 'text',  placeholder: 'نام و نام خانوادگی', ltr: false, disabled: false, col: 1 },
  { key: 'email',      label: 'ایمیل',          icon: EnvelopeIcon, type: 'email', placeholder: 'example@email.com',  ltr: true,  disabled: false, col: 1 },
  { key: 'phone',      label: 'شماره موبایل',   icon: LockClosedIcon, type: 'text', placeholder: '',                  ltr: true,  disabled: true,  col: 2 },
  { key: 'address',    label: 'آدرس',           icon: MapPinIcon,   type: 'text',  placeholder: 'خیابان، کوچه، پلاک', ltr: false, disabled: false, col: 2 },
  { key: 'city',       label: 'شهر',            icon: MapPinIcon,   type: 'text',  placeholder: 'نام شهر',           ltr: false, disabled: false, col: 1 },
  { key: 'postalCode', label: 'کد پستی',        icon: MapPinIcon,   type: 'text',  placeholder: '۱۰ رقم',            ltr: true,  disabled: false, col: 1 },
] as const;

export default function UserProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', address: '', city: '', postalCode: '' });

  useEffect(() => {
    fetch('/api/user/profile', { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          const u = d.data;
          setForm({ fullName: u.full_name || '', email: u.email || '', phone: u.phone_number || '', address: u.main_address || '', city: u.city || '', postalCode: u.postal_code || '' });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ fullName: form.fullName, email: form.email, address: form.address, city: form.city, postalCode: form.postalCode }),
      });
      const d = await r.json();
      if (d.success) toast.success('پروفایل به‌روز شد');
      else toast.error(d.error || 'خطا در ذخیره');
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="space-y-3 max-w-2xl">
      {[1,2,3,4].map(i => <div key={i} className="h-14 rounded-xl skeleton" />)}
    </div>
  );

  const initial = (form.fullName || form.phone || '?')[0];

  return (
    <div dir="rtl" className="max-w-2xl space-y-5">

      {/* Avatar strip */}
      <div className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-surface">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{ background: 'var(--primary-dim)', color: 'var(--primary)', border: '1.5px solid color-mix(in srgb,var(--primary) 30%,transparent)' }}>
          {initial}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-fg truncate">{form.fullName || 'بدون نام'}</p>
          <p className="text-xs text-muted font-mono" dir="ltr">{form.phone}</p>
        </div>
        <span className="mr-auto text-xs px-2 py-0.5 rounded-full border border-border text-subtle">کاربر عادی</span>
      </div>

      {/* Form */}
      <form onSubmit={save} className="space-y-4">
        {/* Row 1: name + email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FIELDS.filter(f => f.col === 1).map(f => (
            <Field key={f.key} field={f} value={(form as any)[f.key]}
              onChange={v => setForm(p => ({ ...p, [f.key]: v }))} />
          ))}
        </div>

        {/* Row 2: phone + address */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FIELDS.filter(f => f.col === 2).map(f => (
            <Field key={f.key} field={f} value={(form as any)[f.key]}
              onChange={v => setForm(p => ({ ...p, [f.key]: v }))} />
          ))}
        </div>

        <div className="pt-1">
          <button type="submit" disabled={saving}
            className="btn btn-primary btn-md w-full sm:w-auto">
            {saving
              ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" /> ذخیره...</>
              : 'ذخیره تغییرات'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ field, value, onChange }: {
  field: typeof FIELDS[number];
  value: string;
  onChange: (v: string) => void;
}) {
  const Icon = field.icon;
  return (
    <div>
      <label className="block text-xs text-muted mb-1 font-medium">{field.label}</label>
      <div className="relative">
        <Icon className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: 'var(--fg-subtle)' }} />
        <input
          type={field.type}
          value={value}
          disabled={field.disabled}
          placeholder={field.placeholder}
          onChange={e => onChange(e.target.value)}
          dir={field.ltr ? 'ltr' : 'rtl'}
          className="admin-input w-full pr-8 text-sm h-9"
          style={field.disabled ? { opacity: 0.45, cursor: 'not-allowed' } : {}}
        />
        {field.disabled && (
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-subtle">قابل تغییر نیست</span>
        )}
      </div>
    </div>
  );
}
