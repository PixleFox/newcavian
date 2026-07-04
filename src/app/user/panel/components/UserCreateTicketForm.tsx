'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object().shape({
  subject: yup.string().required('موضوع الزامی است'),
  initial_message: yup.string().required('پیام اولیه الزامی است'),
});

interface UserCreateTicketFormProps {
  onClose: () => void;
  onRefresh: () => void;
  user_id: number; // Add user_id as a prop
}

export default function UserCreateTicketForm({ onClose, onRefresh, user_id }: UserCreateTicketFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // Add error state

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      subject: '',
      initial_message: '',
    },
  });

  const onSubmit = async (data: { subject: string; initial_message: string }) => {
    setLoading(true);
    setError(null);

    try {
      console.log('Sending to /api/user/tickets:', { ...data, user_id }); // Debug log

      const response = await fetch('/api/user/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, user_id }),
      });

      console.log('Response status:', response.status); // Debug log

      // Check if response is OK before parsing
      if (!response.ok) {
        const errorText = await response.text(); // Get raw text to avoid JSON parse error
        console.error('Server error:', errorText);
        throw new Error(errorText || 'خطا در ایجاد تیکت');
      }

      const result = await response.json(); // Only parse if OK
      console.log('Success:', result);

      reset();
      onRefresh();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطای ناشناخته رخ داد';
      console.error('Error:', err);
      setError(errorMessage); // Show error to user
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-purple-400">ایجاد تیکت جدید</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            ✖️
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400">موضوع</label>
            <input
              {...register('subject')}
              className="w-full p-2 border border-gray-700 bg-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            {errors.subject && <span className="text-red-500 text-sm">{errors.subject.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">پیام اولیه</label>
            <textarea
              {...register('initial_message')}
              className="w-full p-2 border border-gray-700 bg-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              rows={4}
            />
            {errors.initial_message && (
              <span className="text-red-500 text-sm">{errors.initial_message.message}</span>
            )}
          </div>
          {error && (
            <div className="text-red-500 text-sm p-2 bg-red-900/20 rounded">{error}</div>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-gray-200 rounded-lg hover:bg-gray-700"
            >
              لغو
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'در حال ایجاد...' : 'ایجاد تیکت'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}