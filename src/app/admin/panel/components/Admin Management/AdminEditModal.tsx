'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Admin } from './AdminManagement';

interface AdminEditModalProps {
  editAdmin: Admin | null;
  setEditAdmin: React.Dispatch<React.SetStateAction<Admin | null>>;
  handleEditAdmin: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  roleOptions: { value: Admin['role']; label: string }[];
}

export default function AdminEditModal({
  editAdmin,
  setEditAdmin,
  handleEditAdmin,
  isLoading,
  roleOptions,
}: AdminEditModalProps) {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Reset errors when modal opens with new admin
  useEffect(() => {
    if (editAdmin) {
      setValidationErrors({});
    }
  }, [editAdmin]);
  
  const validateForm = () => {
    if (!editAdmin) return {};

    const errors: Record<string, string> = {};
    
    // Phone number validation - Iranian format (09XXXXXXXXX)
    const phoneNumberDigits = editAdmin.phoneNumber.replace(/[^\d]/g, '');
    if (!phoneNumberDigits) {
      errors.phoneNumber = 'شماره تلفن الزامی است';
    } else {
      // Check if it's a valid Iranian mobile number (must be exactly 11 digits starting with 09)
      const isValidIranianMobile = phoneNumberDigits.length === 11 && phoneNumberDigits.startsWith('09');
      if (!isValidIranianMobile) {
        errors.phoneNumber = 'شماره موبایل باید به فرمت 09XXXXXXXXX باشد';
      }
    }

    // First name validation - Persian/English letters only
    if (!editAdmin.firstName.trim()) {
      errors.firstName = 'نام الزامی است';
    } else if (!/^[\u0600-\u06FF\s]+$|^[a-zA-Z\s]+$/.test(editAdmin.firstName.trim())) {
      errors.firstName = 'نام باید فقط شامل حروف فارسی یا انگلیسی باشد';
    }

    // Last name validation - Persian/English letters only
    if (!editAdmin.lastName.trim()) {
      errors.lastName = 'نام خانوادگی الزامی است';
    } else if (!/^[\u0600-\u06FF\s]+$|^[a-zA-Z\s]+$/.test(editAdmin.lastName.trim())) {
      errors.lastName = 'نام خانوادگی باید فقط شامل حروف فارسی یا انگلیسی باشد';
    }

    // Email validation (optional but must be valid if provided)
    if (editAdmin.email) {
      // Simpler validation - just check for @ and . characters
      if (!editAdmin.email.includes('@') || !editAdmin.email.includes('.')) {
        errors.email = 'لطفاً یک ایمیل معتبر وارد کنید';
      }
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    handleEditAdmin(e);
  };

  return (
    <AnimatePresence>
      {editAdmin && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            // Only close modal when clicking outside and not loading
            if (e.target === e.currentTarget && !isLoading) {
              setEditAdmin(null);
            }
          }}
          style={{ pointerEvents: isLoading ? 'none' : 'auto' }}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-[#1E293B] rounded-lg shadow-lg p-4 w-full max-w-lg relative border border-[#334155]"
          >
            <button
              onClick={() => !isLoading && setEditAdmin(null)}
              className="absolute top-4 left-4 text-[#94A3B8] hover:text-white transition-colors"
              disabled={isLoading}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            <h4 className="text-base font-bold text-[#7C3AED] mb-4 font-heading">ویرایش ادمین</h4>

            {Object.keys(validationErrors).length > 0 && (
              <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
                <ul className="list-disc list-inside text-red-500 text-sm">
                  {Object.values(validationErrors).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <label htmlFor="edit-phoneNumber" className="block text-xs font-medium text-[#94A3B8] mb-1 font-body">
                  شماره تلفن
                  <span className="text-red-400 mr-1">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#94A3B8]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <input
                    id="edit-phoneNumber"
                    type="tel"
                    value={editAdmin.phoneNumber}
                    onChange={(e) => setEditAdmin({ ...editAdmin, phoneNumber: e.target.value })}
                    className={`w-full py-2 pr-9 pl-3 bg-[#1E293B] border rounded-lg text-[#E2E8F0] placeholder-[#64748B] focus:outline-none focus:ring-1 transition-all duration-200
                      ${validationErrors.phoneNumber ? 'border-red-500 focus:ring-red-500' : 'border-[#334155] focus:ring-[#7C3AED]'}
                      font-body text-right
                    `}
                    placeholder="09123456789"
                    pattern="^(\+98|0)?9\d{9}$"
                    required
                    aria-label="شماره موبایل"
                    aria-invalid={!!validationErrors.phoneNumber}
                    aria-describedby={validationErrors.phoneNumber ? 'phone-error' : undefined}
                    dir="ltr"
                  />
                  {validationErrors.phoneNumber && (
                    <p id="phone-error" className="mt-1 text-xs text-red-500" role="alert">{validationErrors.phoneNumber}</p>
                  )}
                </div>
              </div>
              <div className="relative">
                <label htmlFor="edit-firstName" className="block text-xs font-medium text-[#94A3B8] mb-1 font-body">
                  نام
                  <span className="text-red-400 mr-1">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#94A3B8]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  </div>
                  <input
                    id="edit-firstName"
                    type="text"
                    value={editAdmin.firstName}
                    onChange={(e) => setEditAdmin({ ...editAdmin, firstName: e.target.value })}
                    className={`w-full py-2 pr-9 pl-3 bg-[#1E293B] border rounded-lg text-[#E2E8F0] placeholder-[#64748B] focus:outline-none focus:ring-1 transition-all duration-200
                      ${validationErrors.firstName ? 'border-red-500 focus:ring-red-500' : 'border-[#334155] focus:ring-[#7C3AED]'}
                      font-body text-right
                    `}
                    placeholder="نام"
                    pattern="^[\u0600-\u06FF\s]+$|^[a-zA-Z\s]+$"
                    required
                    minLength={2}
                    maxLength={50}
                    aria-label="نام"
                    aria-invalid={!!validationErrors.firstName}
                    aria-describedby={validationErrors.firstName ? 'firstname-error' : undefined}
                  />
                  {validationErrors.firstName && (
                    <p id="firstname-error" className="mt-1 text-xs text-red-500" role="alert">{validationErrors.firstName}</p>
                  )}
                </div>
              </div>
              <div className="relative">
                <label htmlFor="edit-lastName" className="block text-xs font-medium text-[#94A3B8] mb-1 font-body">
                  نام خانوادگی
                  <span className="text-red-400 mr-1">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#94A3B8]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    id="edit-lastName"
                    type="text"
                    value={editAdmin.lastName}
                    onChange={(e) => setEditAdmin({ ...editAdmin, lastName: e.target.value })}
                    className={`w-full py-2 pr-9 pl-3 bg-[#1E293B] border rounded-lg text-[#E2E8F0] placeholder-[#64748B] focus:outline-none focus:ring-1 transition-all duration-200
                      ${validationErrors.lastName ? 'border-red-500 focus:ring-red-500' : 'border-[#334155] focus:ring-[#7C3AED]'}
                      font-body text-right
                    `}
                    placeholder="نام خانوادگی"
                    pattern="^[\u0600-\u06FF\s]+$|^[a-zA-Z\s]+$"
                    required
                    minLength={2}
                    maxLength={50}
                    aria-label="نام خانوادگی"
                    aria-invalid={!!validationErrors.lastName}
                    aria-describedby={validationErrors.lastName ? 'lastname-error' : undefined}
                  />
                  {validationErrors.lastName && (
                    <p id="lastname-error" className="mt-1 text-xs text-red-500" role="alert">{validationErrors.lastName}</p>
                  )}
                </div>
              </div>
              <div className="relative">
                <label htmlFor="edit-email" className="block text-xs font-medium text-[#94A3B8] mb-1 font-body">
                  ایمیل (اختیاری)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#94A3B8]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <input
                    id="edit-email"
                    type="email"
                    value={editAdmin.email || ''}
                    onChange={(e) => setEditAdmin({ ...editAdmin, email: e.target.value })}
                    className={`w-full py-2 pr-9 pl-3 bg-[#1E293B] border rounded-lg text-[#E2E8F0] placeholder-[#64748B] focus:outline-none focus:ring-1 transition-all duration-200
                      ${validationErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-[#334155] focus:ring-[#7C3AED]'}
                      font-body text-left
                    `}
                    placeholder="example@domain.com"
                    pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                    aria-label="ایمیل"
                    aria-invalid={!!validationErrors.email}
                    aria-describedby={validationErrors.email ? 'email-error' : undefined}
                    dir="ltr"
                  />
                  {validationErrors.email && (
                    <p id="email-error" className="mt-1 text-xs text-red-500" role="alert">{validationErrors.email}</p>
                  )}
                </div>
              </div>
              <div className="relative">
                <label htmlFor="edit-role" className="block text-xs font-medium text-[#94A3B8] mb-1 font-body">
                  نقش
                  <span className="text-red-400 mr-1">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#94A3B8]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  </div>
                  <select
                    id="edit-role"
                    value={editAdmin.role}
                    onChange={(e) => setEditAdmin({ ...editAdmin, role: e.target.value as Admin['role'] })}
                    className={`w-full py-2 px-9 bg-[#1E293B] border rounded-lg text-[#E2E8F0] placeholder-[#64748B] focus:outline-none focus:ring-1 transition-all duration-200
                      ${validationErrors.role ? 'border-red-500 focus:ring-red-500' : 'border-[#334155] focus:ring-[#7C3AED]'}
                      font-body text-right
                    `}
                    required
                    aria-label="نقش"
                    aria-invalid={!!validationErrors.role}
                    aria-describedby={validationErrors.role ? 'role-error' : undefined}
                  >
                    {roleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {validationErrors.role && (
                    <p id="role-error" className="mt-1 text-xs text-red-500" role="alert">{validationErrors.role}</p>
                  )}

                </div>
              </div>
              <div className="flex gap-3 pt-3">
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: isLoading ? 1 : 1.05 }}
                  whileTap={{ scale: isLoading ? 1 : 0.95 }}
                  className={`flex-1 py-2 px-3 rounded-lg text-white font-semibold font-heading ${
                    isLoading 
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] hover:from-[#6D28D9] hover:to-[#5B21B6] shadow-md hover:shadow-lg'
                  } transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-[#7C3AED] focus:ring-offset-[#1E293B]`}
                >
                  {isLoading && (
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  )}
                  {isLoading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => setEditAdmin(null)}
                  disabled={isLoading}
                  whileHover={{ scale: isLoading ? 1 : 1.03 }}
                  whileTap={{ scale: isLoading ? 1 : 0.97 }}
                  className="flex-1 py-2 px-3 bg-[#334155] hover:bg-[#475569] rounded-lg text-white font-heading transition-all duration-300 border border-[#475569] focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-[#334155] focus:ring-offset-[#1E293B]"
                >
                  لغو
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}