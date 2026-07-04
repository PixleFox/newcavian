'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface ConfirmDeleteModalProps {
  deleteAdminId: number | null;
  setDeleteAdminId: React.Dispatch<React.SetStateAction<number | null>>;
  handleDeleteAdmin: () => Promise<void>;
  isLoading: boolean;
}

const ConfirmDeleteModal = ({
  deleteAdminId,
  setDeleteAdminId,
  handleDeleteAdmin,
  isLoading,
}: ConfirmDeleteModalProps): React.JSX.Element => {
  return (
    <AnimatePresence>
      {deleteAdminId !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            // Close modal when clicking outside
            if (e.target === e.currentTarget && !isLoading) {
              setDeleteAdminId(null);
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-[#1E293B] rounded-xl shadow-2xl p-6 w-full max-w-md relative border border-red-500/30"
          >
            <button
              onClick={() => !isLoading && setDeleteAdminId(null)}
              className="absolute top-4 left-4 text-[#94A3B8] hover:text-white transition-colors"
              disabled={isLoading}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            <div className="text-center mb-6">
              <motion.div 
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 15,
                  delay: 0.2 
                }}
                className="mx-auto bg-red-500/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4 border border-red-500/50"
              >
                <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
              </motion.div>
              <motion.h4 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl font-bold text-red-500 mb-2 font-heading"
              >
                تأیید حذف ادمین
              </motion.h4>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-[#E2E8F0] font-body"
              >
                آیا مطمئن هستید که می‌خواهید این ادمین را حذف کنید؟
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
              >
                <p className="text-red-400 text-sm font-body flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  این عملیات قابل بازگشت نیست
                </p>
              </motion.div>
            </div>
            <div className="flex flex-col gap-3 mt-8">
              <motion.button
                onClick={handleDeleteAdmin}
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.03 }}
                whileTap={{ scale: isLoading ? 1 : 0.97 }}
                className={`w-full py-3 px-4 rounded-lg text-white font-semibold font-heading transition-all duration-300 flex items-center justify-center ${
                  isLoading
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-md hover:shadow-lg'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 focus:ring-offset-[#1E293B]`}
              >
                {isLoading && (
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                )}
                {isLoading ? 'در حال حذف...' : 'حذف ادمین'}
              </motion.button>
              
              <motion.button
                onClick={() => setDeleteAdminId(null)}
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.03 }}
                whileTap={{ scale: isLoading ? 1 : 0.97 }}
                className="w-full py-3 px-4 bg-transparent hover:bg-[#334155]/30 rounded-lg text-white font-semibold font-heading transition-all duration-300 border border-[#475569]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#334155] focus:ring-offset-[#1E293B]"
              >
                انصراف
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDeleteModal;
