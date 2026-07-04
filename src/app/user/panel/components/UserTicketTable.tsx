'use client';
import { useState } from 'react';
import UserTicketDetails from './UserTicketDetails';
import UserCreateTicketForm from './UserCreateTicketForm';
import { formatDate } from 'src/lib/date';

interface TicketMessage {
  id: number;
  sender_type: string;
  message: string;
  created_at: string;
  admin?: { full_name: string };
  user?: { full_name: string };
}

interface Ticket {
  id: number;
  subject: string;
  status: string;
  created_at: string;
  messages: TicketMessage[];
}

interface UserTicketTableProps {
  tickets: Ticket[];
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

export default function UserTicketTable({ tickets, onRefresh, user_id }: UserTicketTableProps) {
  const [showDetails, setShowDetails] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <>
      <div className="mb-6">
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 hover:scale-105 transition-all duration-200"
        >
          ایجاد تیکت جدید
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-600 bg-gradient-to-br from-gray-800 to-gray-900">
        <table className="w-full text-sm text-right text-gray-300">
          <thead className="bg-gradient-to-r from-gray-700 to-gray-600 text-gray-100">
            <tr>
              <th className="px-6 py-4 font-medium">موضوع</th>
              <th className="px-6 py-4 font-medium">وضعیت</th>
              <th className="px-6 py-4 font-medium">تاریخ ایجاد</th>
              <th className="px-6 py-4 font-medium">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-500">
            {tickets.length === 0 ? (
              <tr key="empty">
                <td colSpan={4} className="px-6 py-4 text-center text-gray-400">
                  هیچ تیکتی یافت نشد 🥺
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="hover:bg-gray-700 hover:scale-[1.01] transition-all duration-200 ease-in-out"
                >
                  <td className="px-6 py-4 text-gray-100 max-w-[200px] truncate" title={ticket.subject}>
                    {ticket.subject}
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {statusTranslations[ticket.status] || ticket.status}
                  </td>
                  <td className="px-6 py-4 text-gray-400">{formatDate(ticket.created_at)}</td>
                  <td className="px-6 py-4 space-x-4">
                    <button
                      onClick={() => setShowDetails(ticket.id)}
                      className="text-blue-400 hover:text-blue-600 hover:scale-110 transition-transform duration-200"
                      title="نمایش جزئیات"
                    >
                      👁️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showDetails && (
        <UserTicketDetails
          ticket={tickets.find((t) => t.id === showDetails) || null}
          onClose={() => setShowDetails(null)}
          onRefresh={onRefresh}
          user_id={user_id}
        />
      )}

      {showCreateForm && (
        <UserCreateTicketForm
          onClose={() => setShowCreateForm(false)}
          onRefresh={onRefresh}
          user_id={user_id}
        />
      )}
    </>
  );
}