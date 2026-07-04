'use client';
import { useState } from 'react';
import { formatDate } from 'src/lib/date';

interface TicketMessage {
  id: number;
  sender_type: string;
  message: string;
  created_at: string;
  admin?: { full_name: string };
  user?: { full_name: string };
}

interface UserTicketDetailsProps {
  ticket: {
    id: number;
    subject: string;
    status: string;
    created_at: string;
    messages: TicketMessage[];
  } | null;
  onClose: () => void;
  onRefresh: () => void;
  user_id: number;
}

// Status translations
const statusTranslations: Record<string, string> = {
  OPEN: 'باز',
  IN_PROGRESS: 'در حال بررسی',
  CLOSED: 'بسته شده',
  PENDING: 'در انتظار',
};

export default function UserTicketDetails({ ticket, onClose, onRefresh, user_id }: UserTicketDetailsProps) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !ticket) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user/tickets/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket_id: ticket.id, user_id, message }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Server responded with:', text);
        throw new Error(text || 'خطا در ارسال پیام');
      }

      await response.json();
      setMessage('');
      onRefresh();
    } catch (error) {
      console.error('خطا در ارسال پیام:', error);
      setError(error instanceof Error ? error.message : 'خطای ناشناخته رخ داد');
    } finally {
      setLoading(false);
    }
  };

  if (!ticket) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-purple-400 truncate">{ticket.subject}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            ✖️
          </button>
        </div>

        <div className="space-y-3 text-gray-300">
          <p>
            <strong className="text-gray-400">وضعیت:</strong>{' '}
            {statusTranslations[ticket.status] || ticket.status}
          </p>
          <p>
            <strong className="text-gray-400">تاریخ ایجاد:</strong> {formatDate(ticket.created_at)}
          </p>
        </div>

        <div className="mt-6 border-t border-gray-700 pt-4">
          <h4 className="text-lg font-semibold text-gray-200 mb-4">پیام‌ها</h4>
          <div className="space-y-4 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
            {ticket.messages.map((msg: TicketMessage) => (
              <div
                key={msg.id}
                className={`p-4 rounded-lg shadow-sm max-w-[70%] ${
                  msg.sender_type === 'ADMIN'
                    ? 'bg-blue-900 ml-auto text-right'
                    : 'bg-gray-800 mr-auto text-left'
                }`}
              >
                <p className="text-sm text-gray-200 leading-relaxed break-words">{msg.message}</p>
                <p className="text-xs text-gray-400">
                  {msg.sender_type === 'ADMIN' ? 'ادمین' : 'شما'} - {formatDate(msg.created_at)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleReply} className="mt-6 flex flex-col gap-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="پاسخ خود را اینجا بنویسید..."
            className="w-full p-3 border border-gray-700 bg-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all duration-200 resize-y min-h-[100px]"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
          >
            {loading ? 'در حال ارسال...' : 'ارسال'}
          </button>
          {error && (
            <div className="mt-2 p-3 bg-red-900/80 border border-red-700 rounded-lg text-white text-sm flex justify-between items-center animate-fade-in">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="ml-2 text-red-300 hover:text-white transition-colors">
                ✕
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}