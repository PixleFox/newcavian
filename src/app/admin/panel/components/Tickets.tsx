'use client';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
  MagnifyingGlassIcon, ArrowPathIcon, XMarkIcon,
  ChatBubbleLeftRightIcon, ChevronDownIcon, ChevronUpIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';

interface TicketMsg { id: string; type: string; content: string; createdAt: string; }
interface Ticket {
  id: string; subject: string; status: string; priority: string; category: string;
  createdAt: string; updatedAt: string;
  users: { full_name: string | null; phone_number: string };
  TicketMessage: TicketMsg[];
}

const fmtDate = (d: string) => new Date(d).toLocaleDateString('fa-IR');

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  OPEN:        { label: 'باز',          cls: 'bg-green-950 text-green-400 border-green-900' },
  IN_PROGRESS: { label: 'در بررسی',    cls: 'bg-blue-950 text-blue-400 border-blue-900' },
  RESOLVED:    { label: 'حل شده',      cls: 'bg-surface-2 text-muted border-border' },
  CLOSED:      { label: 'بسته شده',    cls: 'bg-surface text-subtle border-border' },
  PENDING:     { label: 'در انتظار',   cls: 'bg-yellow-950 text-yellow-400 border-yellow-900' },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_CFG[status] || { label: status, cls: 'bg-surface-2 text-muted border-border' };
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs border ${s.cls}`}>{s.label}</span>;
}

function TicketDetail({ ticket, onClose, onUpdated }: { ticket: Ticket; onClose: () => void; onUpdated: (t: Ticket) => void }) {
  const [reply, setReply]     = useState('');
  const [sending, setSending] = useState(false);
  const [msgs, setMsgs]       = useState<TicketMsg[]>(ticket.TicketMessage);

  const changeStatus = async (status: string) => {
    const res = await fetch(`/api/admin/tickets?id=${ticket.id}`, {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const d = await res.json();
    if (res.ok) { toast.success('وضعیت به‌روز شد'); onUpdated({ ...ticket, status }); }
    else toast.error(d.error || 'خطا');
  };

  const sendReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    const res = await fetch('/api/admin/tickets', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId: ticket.id, content: reply }),
    });
    const d = await res.json();
    if (res.ok) {
      setMsgs(m => [...m, d.data]);
      setReply('');
      toast.success('پاسخ ارسال شد');
      onUpdated({ ...ticket, status: 'IN_PROGRESS' });
    } else toast.error(d.error || 'خطا');
    setSending(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <p className="text-fg font-semibold">{ticket.subject}</p>
            <p className="text-subtle text-xs mt-0.5">{ticket.users.full_name || ticket.users.phone_number} · {fmtDate(ticket.createdAt)}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={ticket.status} />
            <button onClick={onClose} className="text-subtle hover:text-fg cursor-pointer transition-colors"><XMarkIcon className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {msgs.map(m => (
            <div key={m.id} className={`flex ${m.type === 'ADMIN' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${m.type === 'ADMIN' ? 'bg-purple-900/40 text-muted rounded-tr-sm' : 'bg-surface-2 text-muted rounded-tl-sm'}`}>
                <p>{m.content}</p>
                <p className="text-xs text-subtle mt-1">{fmtDate(m.createdAt)}</p>
              </div>
            </div>
          ))}
          {msgs.length === 0 && <p className="text-center text-subtle text-sm">پیامی وجود ندارد</p>}
        </div>

        <div className="border-t border-border p-4 space-y-3">
          <div className="flex gap-2 flex-wrap">
            {['RESOLVED', 'CLOSED'].map(s => (
              <button key={s} onClick={() => changeStatus(s)} className="btn btn-sm btn-ghost">
                {STATUS_CFG[s]?.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <textarea value={reply} onChange={e => setReply(e.target.value)} rows={2}
              placeholder="پاسخ ادمین..."
              className="admin-input flex-1 resize-none" />
            <button onClick={sendReply} disabled={sending || !reply.trim()}
              className="btn btn-primary self-stretch flex items-center px-4">
              <PaperAirplaneIcon className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Tickets() {
  const [tickets, setTickets]   = useState<Ticket[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [statusF, setStatusF]   = useState('');
  const [selected, setSelected] = useState<Ticket | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (search) p.set('search', search);
    if (statusF) p.set('status', statusF);
    const res = await fetch(`/api/admin/tickets?${p}`, { credentials: 'include' });
    const d   = await res.json();
    setTickets(d.data || []);
    setLoading(false);
  }, [search, statusF]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const handleUpdated = (updated: Ticket) => {
    setTickets(p => p.map(t => t.id === updated.id ? { ...t, ...updated } : t));
    setSelected(s => s?.id === updated.id ? { ...s, ...updated } : s);
  };

  const counts = tickets.reduce((a, t) => { a[t.status] = (a[t.status] || 0) + 1; return a; }, {} as Record<string, number>);
  const fmt = (n: number) => new Intl.NumberFormat('fa-IR').format(n);

  return (
    <div className="min-h-screen bg-bg text-fg" dir="rtl">
      <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">تیکت‌های پشتیبانی</h1>
            <p className="text-sm text-subtle mt-0.5">{fmt(tickets.length)} تیکت</p>
          </div>
          <button onClick={fetch_} className="p-2 rounded-lg bg-surface-2 hover:bg-surface-3 text-muted hover:text-fg cursor-pointer transition-all">
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { key: 'OPEN', label: 'باز', color: 'text-success' },
            { key: 'IN_PROGRESS', label: 'در بررسی', color: 'text-blue-400' },
            { key: 'PENDING', label: 'در انتظار', color: 'text-yellow-400' },
            { key: 'RESOLVED', label: 'حل شده', color: 'text-muted' },
          ].map(s => (
            <div key={s.key}
              onClick={() => setStatusF(f => f === s.key ? '' : s.key)}
              className="bg-surface border border-border rounded-xl px-4 py-3 cursor-pointer hover:border-border-strong transition-colors">
              <p className="text-xs text-subtle">{s.label}</p>
              <p className={`text-xl font-bold mt-0.5 ${s.color}`}>{fmt(counts[s.key] || 0)}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-52">
            <MagnifyingGlassIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="جستجو..."
              className="admin-input pr-9" />
          </div>
          <select value={statusF} onChange={e => setStatusF(e.target.value)}
            className="admin-input cursor-pointer w-auto">
            <option value="">همه وضعیت‌ها</option>
            {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-2/60">
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted">موضوع</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted">کاربر</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted">وضعیت</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted">تاریخ</th>
                <th className="px-4 py-3 w-12" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading
                ? Array(4).fill(0).map((_,i) => <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="h-4 bg-surface-2 rounded animate-pulse" /></td></tr>)
                : tickets.length === 0
                  ? <tr><td colSpan={5} className="py-14 text-center text-subtle">تیکتی یافت نشد</td></tr>
                  : tickets.map(t => (
                    <tr key={t.id} className="hover:bg-surface-2/30 transition-colors cursor-pointer" onClick={() => setSelected(t)}>
                      <td className="px-4 py-3 text-muted">{t.subject}</td>
                      <td className="px-4 py-3">
                        <p className="text-muted text-sm">{t.users.full_name || '—'}</p>
                        <p className="text-subtle text-xs" dir="ltr">{t.users.phone_number}</p>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                      <td className="px-4 py-3 text-subtle text-xs">{fmtDate(t.createdAt)}</td>
                      <td className="px-4 py-3"><ChatBubbleLeftRightIcon className="w-4 h-4 text-subtle" /></td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {selected && <TicketDetail ticket={selected} onClose={() => setSelected(null)} onUpdated={handleUpdated} />}
    </div>
  );
}
