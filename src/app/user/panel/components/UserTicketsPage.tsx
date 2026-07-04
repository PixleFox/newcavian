'use client';
import { useEffect, useState } from 'react';
import { TicketIcon, PlusIcon, PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  OPEN:        { label: 'باز',           color: 'text-green-400  bg-green-900/30' },
  IN_PROGRESS: { label: 'در حال بررسی',  color: 'text-blue-400   bg-blue-900/30'  },
  RESOLVED:    { label: 'حل شده',        color: 'text-purple-400 bg-purple-900/30' },
  CLOSED:      { label: 'بسته شده',      color: 'text-gray-400   bg-gray-800'     },
  PENDING:     { label: 'در انتظار',     color: 'text-yellow-400 bg-yellow-900/30' },
};

const fmtDate = (d: string) => new Date(d).toLocaleString('fa-IR');

export default function UserTicketsPage() {
  const [tickets, setTickets]   = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState<any | null>(null);
  const [showNew, setShowNew]   = useState(false);
  const [reply, setReply]       = useState('');
  const [sending, setSending]   = useState(false);
  const [newForm, setNewForm]   = useState({ subject: '', description: '', category: 'OTHER', priority: 'MEDIUM' });
  const [creating, setCreating] = useState(false);

  const load = () => {
    setLoading(true);
    fetch('/api/user/tickets', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setTickets(d.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openTicket = (t: any) => { setSelected(t); setReply(''); };

  const sendReply = async () => {
    if (!reply.trim() || !selected) return;
    setSending(true);
    try {
      const r = await fetch('/api/user/tickets/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ticketId: selected.id, content: reply }),
      });
      const d = await r.json();
      if (d.success) {
        setReply('');
        const updated = { ...selected, TicketMessage: [...(selected.TicketMessage || []), d.data] };
        setSelected(updated);
        setTickets(p => p.map(t => t.id === selected.id ? updated : t));
        toast.success('پیام ارسال شد');
      } else toast.error(d.error || 'خطا');
    } finally { setSending(false); }
  };

  const createTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.subject || !newForm.description) return toast.error('موضوع و توضیحات الزامی است');
    setCreating(true);
    try {
      const r = await fetch('/api/user/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newForm),
      });
      const d = await r.json();
      if (d.success) {
        toast.success('تیکت ایجاد شد');
        setShowNew(false);
        setNewForm({ subject: '', description: '', category: 'GENERAL', priority: 'MEDIUM' });
        load();
      } else toast.error(d.error || 'خطا');
    } finally { setCreating(false); }
  };

  return (
    <div dir="rtl" className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TicketIcon className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">پشتیبانی</h2>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-1.5 bg-purple-700 hover:bg-purple-600 text-white text-sm rounded-xl px-4 py-2 transition-colors">
          <PlusIcon className="w-4 h-4" />
          تیکت جدید
        </button>
      </div>

      {/* New ticket modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-[#111827] border border-gray-800 rounded-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <h3 className="text-white font-semibold">ایجاد تیکت جدید</h3>
              <button onClick={() => setShowNew(false)}><XMarkIcon className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={createTicket} className="p-5 space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">موضوع *</label>
                <input value={newForm.subject} onChange={e => setNewForm(p => ({ ...p, subject: e.target.value }))}
                  className="w-full bg-[#0a0f1e] border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-600" placeholder="موضوع تیکت" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">دسته‌بندی</label>
                  <select value={newForm.category} onChange={e => setNewForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full bg-[#0a0f1e] border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-600">
                    <option value="OTHER">عمومی</option>
                    <option value="ORDER_ISSUE">سفارش</option>
                    <option value="PAYMENT_PROBLEM">پرداخت</option>
                    <option value="TECHNICAL_ISSUE">فنی</option>
                    <option value="SHIPPING_ISSUE">ارسال</option>
                    <option value="RETURN_REQUEST">مرجوعی</option>
                    <option value="ACCOUNT_ISSUE">حساب کاربری</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">اولویت</label>
                  <select value={newForm.priority} onChange={e => setNewForm(p => ({ ...p, priority: e.target.value }))}
                    className="w-full bg-[#0a0f1e] border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-600">
                    <option value="LOW">کم</option>
                    <option value="MEDIUM">متوسط</option>
                    <option value="HIGH">زیاد</option>
                    <option value="URGENT">فوری</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">توضیحات *</label>
                <textarea rows={4} value={newForm.description} onChange={e => setNewForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full bg-[#0a0f1e] border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white resize-none focus:outline-none focus:border-purple-600" placeholder="مشکل خود را شرح دهید..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={creating} className="flex-1 bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-medium transition-colors">
                  {creating ? 'در حال ارسال...' : 'ارسال تیکت'}
                </button>
                <button type="button" onClick={() => setShowNew(false)} className="px-5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm transition-colors">
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-[#111827] border border-gray-800 rounded-2xl w-full max-w-lg flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 flex-shrink-0">
              <div>
                <p className="text-white font-semibold text-sm">{selected.subject}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_MAP[selected.status]?.color}`}>
                  {STATUS_MAP[selected.status]?.label || selected.status}
                </span>
              </div>
              <button onClick={() => setSelected(null)}><XMarkIcon className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {(selected.TicketMessage || []).map((m: any) => (
                <div key={m.id} className={`flex ${m.type === 'USER' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${m.type === 'USER' ? 'bg-purple-900/50 text-white' : 'bg-gray-800 text-gray-200'}`}>
                    <p>{m.content}</p>
                    <p className={`text-xs mt-1 ${m.type === 'USER' ? 'text-purple-400' : 'text-gray-500'}`} dir="ltr">{fmtDate(m.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
            {selected.status !== 'CLOSED' && selected.status !== 'RESOLVED' && (
              <div className="flex gap-2 p-4 border-t border-gray-800 flex-shrink-0">
                <input
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                  placeholder="پاسخ خود را بنویسید..."
                  className="flex-1 bg-[#0a0f1e] border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-600"
                />
                <button onClick={sendReply} disabled={sending || !reply.trim()} className="bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white rounded-xl px-4 transition-colors">
                  <PaperAirplaneIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tickets list */}
      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : tickets.length === 0 ? (
        <div className="bg-[#111827] border border-gray-800 rounded-2xl flex flex-col items-center justify-center py-16 gap-3">
          <TicketIcon className="w-10 h-10 text-gray-700" />
          <p className="text-gray-500 text-sm">تیکتی ندارید</p>
        </div>
      ) : (
        <div className="bg-[#111827] border border-gray-800 rounded-2xl overflow-hidden">
          {tickets.map((t, i) => (
            <button key={t.id} onClick={() => openTicket(t)}
              className="w-full flex items-center justify-between px-5 py-4 text-right hover:bg-gray-800/30 transition-colors border-b border-gray-800/50 last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{t.subject}</p>
                <p className="text-gray-600 text-xs mt-0.5">{fmtDate(t.createdAt)}</p>
              </div>
              <div className="flex items-center gap-3 mr-3 flex-shrink-0">
                <span className="text-xs text-gray-600">{(t.TicketMessage || []).length} پیام</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_MAP[t.status]?.color}`}>
                  {STATUS_MAP[t.status]?.label || t.status}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
