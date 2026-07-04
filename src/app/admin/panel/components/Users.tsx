'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import {
  MagnifyingGlassIcon, ArrowPathIcon, UserPlusIcon,
  PencilSquareIcon, TrashIcon, XMarkIcon,
  CheckCircleIcon, ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

// ─── Types ────────────────────────────────────────────────────────────────────

interface User {
  id: number;
  full_name: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone_number: string;
  role: string;
  status: string;
  level: number;
  email_verified: boolean;
  phone_verified: boolean;
  last_login: string | null;
  created_at: string;
  main_address: string | null;
  city: string | null;
  referral_code: string | null;
  _count: { Order: number };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtDate = (d: string | null) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

const displayName = (u: User) =>
  u.full_name || [u.firstName, u.lastName].filter(Boolean).join(' ') || '—';

const ROLE_LABEL: Record<string, string> = {
  CUSTOMER: 'مشتری', ADMIN: 'ادمین', MANAGER: 'مدیر', SUPER_ADMIN: 'سوپر ادمین',
};
const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  ACTIVE:                    { label: 'فعال',          cls: 'bg-green-950 text-green-400 border-green-900' },
  INACTIVE:                  { label: 'غیرفعال',       cls: 'bg-surface-2 text-muted border-border' },
  BANNED:                    { label: 'مسدود',          cls: 'bg-red-950 text-red-400 border-red-900' },
  EMAIL_VERIFICATION_PENDING:{ label: 'در انتظار تأیید',cls: 'bg-yellow-950 text-yellow-400 border-yellow-900' },
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-border/50">
      {[45, 30, 25, 20, 22, 20, 15].map((w, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className="h-3.5 bg-surface-2 rounded animate-pulse" style={{ width: `${w}%` }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({ user, onClose, onSaved }: { user: User; onClose: () => void; onSaved: (u: User) => void }) {
  const [form, setForm] = useState({
    full_name:    user.full_name    || '',
    email:        user.email        || '',
    phone_number: user.phone_number || '',
    role:         user.role         || 'CUSTOMER',
    status:       user.status       || 'ACTIVE',
    level:        user.level        ?? 1,
    main_address: user.main_address || '',
    city:         user.city         || '',
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users?id=${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('کاربر بروز شد');
        onSaved({ ...user, ...form });
      } else {
        toast.error(data.error || 'خطا');
      }
    } catch {
      toast.error('خطای اتصال');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-fg font-semibold">ویرایش کاربر</h2>
          <button onClick={onClose} className="text-subtle hover:text-fg cursor-pointer transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs text-muted mb-1.5">نام کامل</label>
            <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} className="admin-input" placeholder="نام و نام خانوادگی" />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5">ایمیل</label>
            <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="admin-input" placeholder="email@example.com" dir="ltr" />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5">شماره موبایل</label>
            <input value={form.phone_number} onChange={e => setForm(f => ({ ...f, phone_number: e.target.value }))} className="admin-input" dir="ltr" />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5">نقش</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="admin-input cursor-pointer">
              {Object.entries(ROLE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5">وضعیت</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="admin-input cursor-pointer">
              {Object.entries(STATUS_CFG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5">سطح کاربری</label>
            <input type="number" min={1} max={10} value={form.level} onChange={e => setForm(f => ({ ...f, level: parseInt(e.target.value) || 1 }))} className="admin-input" />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5">شهر</label>
            <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="admin-input" placeholder="تهران" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-muted mb-1.5">آدرس</label>
            <input value={form.main_address} onChange={e => setForm(f => ({ ...f, main_address: e.target.value }))} className="admin-input" placeholder="آدرس" />
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
          <button onClick={onClose} className="btn btn-md btn-ghost">لغو</button>
          <button onClick={save} disabled={saving} className="btn btn-md btn-primary flex items-center gap-2">
            {saving && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            ذخیره
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Users() {
  const [users, setUsers]       = useState<User[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [statusF, setStatusF]   = useState('');
  const [editUser, setEditUser] = useState<User | null>(null);
  const [pagination, setPag]    = useState({ page: 1, total: 0, totalPages: 1, limit: 20 });
  const [stats, setStats]       = useState({ total: 0, active: 0, banned: 0, new: 0 });

  const fetch_ = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page), limit: '20',
        ...(search   && { search }),
        ...(statusF  && { status: statusF }),
      });
      const res  = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
        const pg = data.pagination;
        setPag({ page, total: pg.total, totalPages: pg.totalPages, limit: pg.limit });

        const active = data.data.filter((u: User) => u.status === 'ACTIVE').length;
        const banned = data.data.filter((u: User) => u.status === 'BANNED').length;
        const now = Date.now();
        const newU = data.data.filter((u: User) => now - new Date(u.created_at).getTime() < 7 * 86400000).length;
        setStats({ total: pg.total, active, banned, new: newU });
      } else {
        toast.error('خطا در دریافت کاربران');
      }
    } catch {
      toast.error('خطای اتصال');
    } finally {
      setLoading(false);
    }
  }, [search, statusF]);

  useEffect(() => { fetch_(1); }, [search, statusF]);

  const handleDelete = async (id: number) => {
    if (!confirm('این کاربر حذف (غیرفعال) شود؟')) return;
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
      const d = await res.json();
      if (d.success) {
        toast.success('کاربر حذف شد');
        setUsers(p => p.filter(u => u.id !== id));
        setStats(s => ({ ...s, total: s.total - 1 }));
      } else {
        toast.error(d.error || 'خطا');
      }
    } catch {
      toast.error('خطای اتصال');
    }
  };

  const handleSaved = (updated: User) => {
    setUsers(prev => prev.map(u => u.id === updated.id ? { ...u, ...updated } : u));
    setEditUser(null);
  };

  const fmt = (n: number) => new Intl.NumberFormat('fa-IR').format(n);

  return (
    <div className="min-h-screen bg-bg text-fg" dir="rtl">
      <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-fg">مدیریت کاربران</h1>
            <p className="text-sm text-subtle mt-0.5">مشاهده و مدیریت اعضای فروشگاه</p>
          </div>
          <button onClick={() => fetch_(pagination.page)}
            className="p-2 rounded-lg bg-surface-2 hover:bg-surface-3 text-muted hover:text-fg transition-all cursor-pointer">
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'کل کاربران', value: fmt(stats.total), color: 'text-fg' },
            { label: 'کاربران فعال', value: fmt(stats.active), color: 'text-success' },
            { label: 'مسدود', value: fmt(stats.banned), color: 'text-error' },
            { label: 'عضو جدید (۷ روز)', value: fmt(stats.new), color: 'text-primary' },
          ].map(s => (
            <div key={s.label} className="bg-surface border border-border rounded-xl px-5 py-4">
              <p className="text-xs text-subtle mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-52">
            <MagnifyingGlassIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="جستجو در نام، ایمیل، موبایل..."
              className="admin-input pr-9" />
          </div>
          <select value={statusF} onChange={e => setStatusF(e.target.value)}
            className="admin-input cursor-pointer w-auto">
            <option value="">همه وضعیت‌ها</option>
            {Object.entries(STATUS_CFG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-2/60">
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted uppercase">کاربر</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted uppercase">موبایل</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted uppercase">وضعیت</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted uppercase">نقش</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted uppercase">سفارش</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted uppercase">آخرین ورود</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted uppercase">عضویت</th>
                  <th className="px-4 py-3 w-16" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loading
                  ? Array(6).fill(0).map((_, i) => <SkeletonRow key={i} />)
                  : users.length === 0
                    ? (
                      <tr>
                        <td colSpan={8} className="py-16 text-center text-subtle">
                          <UserPlusIcon className="w-10 h-10 mx-auto mb-3 text-muted" />
                          کاربری یافت نشد
                        </td>
                      </tr>
                    )
                    : users.map(u => {
                      const sc = STATUS_CFG[u.status] || { label: u.status, cls: 'bg-surface-2 text-muted border-border' };
                      return (
                        <tr key={u.id} className="group hover:bg-surface-2/40 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-purple-900/50 border border-purple-800/40 flex items-center justify-center text-purple-300 text-xs font-bold flex-shrink-0">
                                {(displayName(u)[0] || '?').toUpperCase()}
                              </div>
                              <div>
                                <p className="text-fg text-sm font-medium">{displayName(u)}</p>
                                <p className="text-subtle text-xs">{u.email || '—'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-muted text-sm tabular-nums" dir="ltr">{u.phone_number}</span>
                              {u.phone_verified
                                ? <CheckCircleIcon className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                : <ExclamationCircleIcon className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />}
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs border ${sc.cls}`}>{sc.label}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-muted text-xs">{ROLE_LABEL[u.role] || u.role}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-muted text-sm tabular-nums">{u._count.Order}</span>
                          </td>
                          <td className="px-4 py-3.5 text-subtle text-xs tabular-nums">{fmtDate(u.last_login)}</td>
                          <td className="px-4 py-3.5 text-subtle text-xs tabular-nums">{fmtDate(u.created_at)}</td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                              <button onClick={() => setEditUser(u)}
                                className="p-1.5 rounded-lg hover:bg-surface-3 text-muted hover:text-primary cursor-pointer transition-colors" title="ویرایش">
                                <PencilSquareIcon className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDelete(u.id)}
                                className="p-1.5 rounded-lg hover:bg-red-900/30 text-muted hover:text-error cursor-pointer transition-colors" title="حذف">
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

        {/* Pagination */}
        {pagination.totalPages > 1 && !loading && (
          <div className="flex items-center justify-between py-2">
            <p className="text-xs text-subtle">
              نمایش {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} از <span className="text-muted">{fmt(pagination.total)}</span>
            </p>
            <div className="flex gap-1">
              <button disabled={pagination.page === 1} onClick={() => fetch_(pagination.page - 1)}
                className="px-3 py-1.5 text-sm rounded-lg bg-surface-2 text-muted hover:bg-surface-3 disabled:opacity-30 cursor-pointer transition-colors">
                ‹ قبلی
              </button>
              <button disabled={pagination.page === pagination.totalPages} onClick={() => fetch_(pagination.page + 1)}
                className="px-3 py-1.5 text-sm rounded-lg bg-surface-2 text-muted hover:bg-surface-3 disabled:opacity-30 cursor-pointer transition-colors">
                بعدی ›
              </button>
            </div>
          </div>
        )}
      </div>

      {editUser && <EditModal user={editUser} onClose={() => setEditUser(null)} onSaved={handleSaved} />}
    </div>
  );
}
