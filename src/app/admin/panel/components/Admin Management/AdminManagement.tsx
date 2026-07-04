'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import {
  MagnifyingGlassIcon, ArrowPathIcon, UserPlusIcon,
  PencilSquareIcon, TrashIcon, XMarkIcon,
  CheckCircleIcon, NoSymbolIcon, ShieldCheckIcon,
  EyeSlashIcon, ChevronDownIcon,
} from '@heroicons/react/24/outline';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Admin {
  id: number;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  email: string | null;
  role: 'OWNER' | 'MANAGER' | 'SELLER' | 'MARKETER' | 'OPERATOR';
  isActive: boolean;
  createdAt: string;
}

const ROLE_OPTIONS = [
  { value: 'OWNER',    label: 'مالک',     color: 'text-yellow-400 bg-yellow-950 border-yellow-800' },
  { value: 'MANAGER',  label: 'مدیر',     color: 'text-purple-400 bg-purple-950 border-purple-800' },
  { value: 'SELLER',   label: 'فروشنده',  color: 'text-blue-400   bg-blue-950   border-blue-800'   },
  { value: 'MARKETER', label: 'بازاریاب', color: 'text-green-400  bg-green-950  border-green-800'  },
  { value: 'OPERATOR', label: 'اپراتور',  color: 'text-gray-400   bg-gray-800   border-gray-700'   },
] as const;

const roleLabel = (r: string) => ROLE_OPTIONS.find(o => o.value === r)?.label || r;
const roleCls   = (r: string) => ROLE_OPTIONS.find(o => o.value === r)?.color || 'text-gray-400 bg-gray-800 border-gray-700';

const fmtDate = (d: string) => new Date(d).toLocaleDateString('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' });
const fmtPhone = (p: string) => p.startsWith('+98') ? '0' + p.slice(3) : p;

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-800/50">
      {[50,30,25,22,20,18,14].map((w,i) => (
        <td key={i} className="px-4 py-3.5">
          <div className="h-3.5 bg-gray-800 rounded animate-pulse" style={{ width: `${w}%` }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Create / Edit Modal ──────────────────────────────────────────────────────

interface ModalProps {
  admin?: Admin | null;
  onClose: () => void;
  onSaved: (a: Admin) => void;
  myRole: string | null;
}

function AdminModal({ admin, onClose, onSaved, myRole }: ModalProps) {
  const isEdit = !!admin;
  const [form, setForm] = useState({
    firstName:   admin?.firstName   || '',
    lastName:    admin?.lastName    || '',
    phoneNumber: admin ? fmtPhone(admin.phoneNumber) : '',
    email:       admin?.email       || '',
    password:    '',
    role:        admin?.role        || 'OPERATOR' as Admin['role'],
  });
  const [saving, setSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const save = async () => {
    if (!form.firstName || !form.lastName || !form.phoneNumber) {
      toast.error('نام، نام خانوادگی و شماره الزامی است'); return;
    }
    if (!isEdit && form.password.length < 8) {
      toast.error('رمز عبور حداقل ۸ کاراکتر'); return;
    }
    setSaving(true);
    try {
      // normalize phone
      const digits = form.phoneNumber.replace(/\D/g, '');
      const phone = digits.length === 11 && digits[0] === '0' ? `+98${digits.slice(1)}` : `+98${digits}`;

      const url  = isEdit ? `/api/admin?id=${admin!.id}` : '/api/admin/create';
      const method = isEdit ? 'PUT' : 'POST';
      const body: any = { ...form, phoneNumber: phone };
      if (isEdit && !body.password) delete body.password;

      const res  = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(body) });
      const data = await res.json();

      if (!res.ok || !data.success) throw new Error(data.error || 'خطا');

      toast.success(isEdit ? 'ادمین ویرایش شد' : 'ادمین ساخته شد');
      onSaved(data.data || { ...admin, ...form, phoneNumber: phone });
    } catch (e: any) {
      toast.error(e.message || 'خطای سرور');
    } finally {
      setSaving(false);
    }
  };

  const inp = 'w-full bg-[#1e2535] border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-600/40 focus:border-purple-700 outline-none placeholder-gray-600 transition-all';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="bg-[#0f172a] border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-white font-semibold">{isEdit ? 'ویرایش ادمین' : 'افزودن ادمین جدید'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white cursor-pointer transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">نام <span className="text-purple-400">*</span></label>
            <input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} className={inp} placeholder="علی" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">نام خانوادگی <span className="text-purple-400">*</span></label>
            <input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} className={inp} placeholder="احمدی" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">شماره موبایل <span className="text-purple-400">*</span></label>
            <input value={form.phoneNumber} onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))} className={inp} dir="ltr" placeholder="09123456789" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">ایمیل</label>
            <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inp} dir="ltr" placeholder="admin@example.com" />
          </div>
          <div className="relative">
            <label className="block text-xs text-gray-400 mb-1.5">رمز عبور {!isEdit && <span className="text-purple-400">*</span>}</label>
            <input
              type={showPw ? 'text' : 'password'}
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className={inp + ' pl-9'}
              dir="ltr"
              placeholder={isEdit ? 'برای تغییر وارد کنید' : 'حداقل ۸ کاراکتر'}
            />
            <button type="button" onClick={() => setShowPw(s => !s)}
              className="absolute left-3 bottom-3 text-gray-500 hover:text-white cursor-pointer transition-colors">
              {showPw ? <EyeSlashIcon className="w-4 h-4" /> : <ShieldCheckIcon className="w-4 h-4" />}
            </button>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">نقش</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as Admin['role'] }))}
              className={inp + ' cursor-pointer appearance-none'} disabled={myRole !== 'OWNER' && form.role === 'OWNER'}>
              {ROLE_OPTIONS.map(r => (
                <option key={r.value} value={r.value} disabled={myRole !== 'OWNER' && r.value === 'OWNER'}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-800">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 rounded-xl cursor-pointer transition-colors">لغو</button>
          <button onClick={save} disabled={saving}
            className="px-5 py-2 text-sm bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white rounded-xl cursor-pointer transition-colors flex items-center gap-2">
            {saving && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {isEdit ? 'ذخیره تغییرات' : 'ایجاد ادمین'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminManagement() {
  const [admins, setAdmins]       = useState<Admin[]>([]);
  const [myRole, setMyRole]       = useState<string | null>(null);
  const [myId, setMyId]           = useState<number | null>(null);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [showCreate, setShowCreate] = useState(false);
  const [editAdmin, setEditAdmin]   = useState<Admin | null>(null);
  const [toggling, setToggling]     = useState<number | null>(null);

  // fetch my role
  useEffect(() => {
    fetch('/api/admin/auth/me', { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          const a = d.admin || d.data;
          setMyRole(a?.role || null);
          setMyId(a?.id || null);
        }
      }).catch(() => {});
  }, []);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/admin', { credentials: 'include' });
      const data = await res.json();
      if (res.ok) setAdmins(data.data || []);
      else toast.error(data.error || 'خطا در بارگذاری');
    } catch {
      toast.error('خطای اتصال');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  const filtered = useMemo(() => admins.filter(a => {
    const name  = `${a.firstName} ${a.lastName}`.toLowerCase();
    const matchS = !search || name.includes(search.toLowerCase()) || a.phoneNumber.includes(search) || a.email?.toLowerCase().includes(search.toLowerCase());
    const matchR = roleFilter === 'ALL' || a.role === roleFilter;
    return matchS && matchR;
  }), [admins, search, roleFilter]);

  const handleToggleActive = async (admin: Admin) => {
    setToggling(admin.id);
    const prev = admin.isActive;
    setAdmins(p => p.map(a => a.id === admin.id ? { ...a, isActive: !prev } : a));
    try {
      const res = await fetch(`/api/admin?id=${admin.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ isActive: !prev }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setAdmins(p => p.map(a => a.id === admin.id ? { ...a, isActive: prev } : a));
        toast.error(data.error || 'خطا');
      } else {
        toast.success(!prev ? 'ادمین فعال شد' : 'ادمین غیرفعال شد');
      }
    } catch {
      setAdmins(p => p.map(a => a.id === admin.id ? { ...a, isActive: prev } : a));
      toast.error('خطای اتصال');
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('این ادمین حذف شود؟')) return;
    try {
      const res = await fetch(`/api/admin?id=${id}`, { method: 'DELETE', credentials: 'include' });
      const d   = await res.json();
      if (res.ok) {
        setAdmins(p => p.filter(a => a.id !== id));
        toast.success('ادمین حذف شد');
      } else {
        toast.error(d.error || 'خطا');
      }
    } catch {
      toast.error('خطای اتصال');
    }
  };

  const handleSaved = (saved: Admin) => {
    setAdmins(prev => {
      const exists = prev.find(a => a.id === saved.id);
      return exists ? prev.map(a => a.id === saved.id ? { ...a, ...saved } : a) : [saved, ...prev];
    });
    setShowCreate(false);
    setEditAdmin(null);
  };

  const isOwner = myRole === 'OWNER';
  const fmt = (n: number) => new Intl.NumberFormat('fa-IR').format(n);

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white" dir="rtl">
      <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-white">مدیریت ادمین‌ها</h1>
            <p className="text-sm text-gray-500 mt-0.5">مشاهده و مدیریت حساب‌های ادمین</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchAdmins}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all cursor-pointer">
              <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            {isOwner && (
              <button onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer shadow-lg shadow-purple-900/30">
                <UserPlusIcon className="w-4 h-4" /> افزودن ادمین
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'کل ادمین‌ها', value: fmt(admins.length), color: 'text-white' },
            { label: 'فعال', value: fmt(admins.filter(a => a.isActive).length), color: 'text-green-400' },
            { label: 'غیرفعال', value: fmt(admins.filter(a => !a.isActive).length), color: 'text-gray-400' },
            { label: 'مالک', value: fmt(admins.filter(a => a.role === 'OWNER').length), color: 'text-yellow-400' },
          ].map(s => (
            <div key={s.label} className="bg-[#111827] border border-gray-800 rounded-xl px-5 py-4">
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-52">
            <MagnifyingGlassIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="جستجو در نام، موبایل، ایمیل..."
              className="w-full bg-[#111827] border border-gray-800 text-white placeholder-gray-600 rounded-xl pr-9 pl-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-600 outline-none transition-all" />
          </div>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            className="bg-[#111827] border border-gray-800 text-sm text-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-600 outline-none cursor-pointer">
            <option value="ALL">همه نقش‌ها</option>
            {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>

        {/* My role badge */}
        {myRole && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <ShieldCheckIcon className="w-3.5 h-3.5 text-purple-400" />
            نقش شما:
            <span className={`px-2 py-0.5 rounded-full border text-xs ${roleCls(myRole)}`}>{roleLabel(myRole)}</span>
            {!isOwner && <span className="text-gray-600">— برخی عملیات‌ها فقط برای مالک قابل انجام است</span>}
          </div>
        )}

        {/* Table */}
        <div className="bg-[#111827] border border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-900/60">
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">ادمین</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">موبایل</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">نقش</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">وضعیت</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">عضویت</th>
                  <th className="px-4 py-3 w-24" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {loading
                  ? Array(4).fill(0).map((_, i) => <SkeletonRow key={i} />)
                  : filtered.length === 0
                    ? (
                      <tr>
                        <td colSpan={6} className="py-16 text-center text-gray-500">
                          <UserPlusIcon className="w-10 h-10 mx-auto mb-3 text-gray-700" />
                          ادمینی یافت نشد
                        </td>
                      </tr>
                    )
                    : filtered.map(admin => (
                      <tr key={admin.id} className="group hover:bg-gray-800/40 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-900/50 border border-purple-800/40 flex items-center justify-center text-purple-300 text-xs font-bold flex-shrink-0">
                              {admin.firstName?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <p className="text-white text-sm font-medium">{admin.firstName} {admin.lastName}
                                {admin.id === myId && <span className="mr-1.5 text-[10px] text-purple-400 bg-purple-900/30 px-1.5 py-0.5 rounded-full">شما</span>}
                              </p>
                              <p className="text-gray-500 text-xs">{admin.email || '—'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-gray-300 text-sm tabular-nums" dir="ltr">
                          {fmtPhone(admin.phoneNumber)}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs border ${roleCls(admin.role)}`}>
                            {roleLabel(admin.role)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            {admin.isActive
                              ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-950 text-green-400 border border-green-900">
                                  <CheckCircleIcon className="w-3 h-3" />فعال
                                </span>
                              : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-800 text-gray-400 border border-gray-700">
                                  <NoSymbolIcon className="w-3 h-3" />غیرفعال
                                </span>
                            }
                            {isOwner && admin.id !== myId && (
                              <button
                                onClick={() => handleToggleActive(admin)}
                                disabled={toggling === admin.id}
                                className={`w-10 h-5 rounded-full relative transition-all duration-300 cursor-pointer disabled:opacity-50 ${admin.isActive ? 'bg-green-600' : 'bg-gray-700'}`}
                                title={admin.isActive ? 'غیرفعال کردن' : 'فعال کردن'}
                              >
                                {toggling === admin.id
                                  ? <span className="absolute inset-0 flex items-center justify-center"><div className="w-2.5 h-2.5 border border-white/50 border-t-white rounded-full animate-spin" /></span>
                                  : <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${admin.isActive ? 'left-[22px]' : 'left-0.5'}`} />
                                }
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-gray-500 text-xs tabular-nums">{fmtDate(admin.createdAt)}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                            {(isOwner || admin.id === myId) && (
                              <button onClick={() => setEditAdmin(admin)}
                                className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-purple-400 cursor-pointer transition-colors" title="ویرایش">
                                <PencilSquareIcon className="w-4 h-4" />
                              </button>
                            )}
                            {isOwner && admin.id !== myId && (
                              <button onClick={() => handleDelete(admin.id)}
                                className="p-1.5 rounded-lg hover:bg-red-900/30 text-gray-400 hover:text-red-400 cursor-pointer transition-colors" title="حذف">
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-gray-600 text-center">
          {!loading && `${fmt(filtered.length)} ادمین نمایش داده می‌شود`}
        </p>
      </div>

      {(showCreate || editAdmin) && (
        <AdminModal
          admin={editAdmin}
          onClose={() => { setShowCreate(false); setEditAdmin(null); }}
          onSaved={handleSaved}
          myRole={myRole}
        />
      )}
    </div>
  );
}
