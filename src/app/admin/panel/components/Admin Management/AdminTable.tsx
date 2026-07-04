'use client';
import { PencilSquareIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon, ShieldExclamationIcon, LockClosedIcon, CheckBadgeIcon, NoSymbolIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Admin } from './AdminManagement';
import { usePermissions } from '@/hooks/usePermissions';
import { canEditAdminRole, AdminRoleType } from '@/lib/permissions';

interface AdminTableProps {
  admins: Admin[];
  fetchLoading: boolean;
  roleOptions: { value: Admin['role']; label: string }[];
  handleEdit?: (admin: Admin) => void;
  handleDelete?: (id: number) => void;
  setAdmins: (admins: Admin[]) => void;
}

export default function AdminTable({
  admins,
  fetchLoading,
  roleOptions,
  handleEdit,
  handleDelete,
  setAdmins,
}: AdminTableProps) {
  const { adminRole, adminId, canEditAdmin } = usePermissions();
  const [sortField, setSortField] = useState<keyof Admin | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: keyof Admin) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedAdmins = [...admins].sort((a, b) => {
    if (!sortField) return 0;

    const fieldA = a[sortField];
    const fieldB = b[sortField];

    if (fieldA === fieldB) return 0;

    // Handle null values
    if (fieldA === null) return sortDirection === 'asc' ? -1 : 1;
    if (fieldB === null) return sortDirection === 'asc' ? 1 : -1;

    // Compare based on field type
    const comparison = fieldA < fieldB ? -1 : 1;
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-base font-semibold text-purple-400 font-heading">لیست ادمین‌ها</h4>
        <div className="text-xs text-purple-300 bg-purple-900/20 px-3 py-1 rounded-full border border-purple-700/30">{admins.length} ادمین</div>
      </div>

      {fetchLoading ? (
        <div className="bg-[#1E293B]/50 rounded-xl p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600 mb-2"></div>
          <p className="text-purple-300 font-body">در حال بارگذاری ادمین‌ها...</p>
        </div>
      ) : admins.length === 0 ? (
        <div className="bg-purple-900/10 border border-purple-700/20 rounded-xl p-8 text-center">
          <div className="text-2xl mb-2">🔍</div>
          <p className="text-purple-300 font-body">هیچ ادمینی یافت نشد</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md">
          <table className="w-full text-right text-[#E2E8F0] font-body">
            <thead className="bg-purple-900/30">
              <tr>
                <th onClick={() => handleSort('id')} className="p-2 text-xs font-medium text-purple-300 cursor-pointer hover:bg-purple-800/30 transition-colors text-center">
                  <div className="flex items-center justify-between">
                    شناسه
                    {sortField === 'id' && (
                      <span>{sortDirection === 'asc' ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}</span>
                    )}
                  </div>
                </th>
                <th onClick={() => handleSort('phoneNumber')} className="p-2 text-xs font-medium text-purple-300 cursor-pointer hover:bg-purple-800/30 transition-colors text-center">
                  <div className="flex items-center justify-between">
                    شماره تلفن
                    {sortField === 'phoneNumber' && (
                      <span>{sortDirection === 'asc' ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}</span>
                    )}
                  </div>
                </th>
                <th onClick={() => handleSort('firstName')} className="p-2 text-xs font-medium text-purple-300 cursor-pointer hover:bg-purple-800/30 transition-colors text-center">
                  <div className="flex items-center justify-between">
                    نام
                    {sortField === 'firstName' && (
                      <span>{sortDirection === 'asc' ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}</span>
                    )}
                  </div>
                </th>
                <th onClick={() => handleSort('lastName')} className="p-2 text-xs font-medium text-purple-300 cursor-pointer hover:bg-purple-800/30 transition-colors text-center">
                  <div className="flex items-center justify-between">
                    نام خانوادگی
                    {sortField === 'lastName' && (
                      <span>{sortDirection === 'asc' ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}</span>
                    )}
                  </div>
                </th>
                <th onClick={() => handleSort('email')} className="p-2 text-xs font-medium text-purple-300 cursor-pointer hover:bg-purple-800/30 transition-colors text-center">
                  <div className="flex items-center justify-between">
                    ایمیل
                    {sortField === 'email' && (
                      <span>{sortDirection === 'asc' ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}</span>
                    )}
                  </div>
                </th>
                <th onClick={() => handleSort('role')} className="p-2 text-xs font-medium text-purple-300 cursor-pointer hover:bg-purple-800/30 transition-colors text-center">
                  <div className="flex items-center justify-between">
                    نقش
                    {sortField === 'role' && (
                      <span>{sortDirection === 'asc' ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}</span>
                    )}
                  </div>
                </th>
                <th onClick={() => handleSort('isActive')} className="p-2 text-xs font-medium text-purple-300 cursor-pointer hover:bg-purple-800/30 transition-colors text-center">
                  <div className="flex items-center justify-between">
                    وضعیت
                    {sortField === 'isActive' && (
                      <span>{sortDirection === 'asc' ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}</span>
                    )}
                  </div>
                </th>
                <th onClick={() => handleSort('createdAt')} className="p-2 text-xs font-medium text-purple-300 cursor-pointer hover:bg-purple-800/30 transition-colors text-center">
                  <div className="flex items-center justify-between">
                    تاریخ ایجاد
                    {sortField === 'createdAt' && (
                      <span>{sortDirection === 'asc' ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}</span>
                    )}
                  </div>
                </th>
                <th className="p-2 text-xs font-medium text-purple-300 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-900/20">
              {sortedAdmins.map((admin, index) => (
                <motion.tr
                  key={admin.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  className="border-b border-purple-900/20 hover:bg-purple-900/10 transition-all duration-200"
                >
                  <td className="p-2 text-xs font-medium text-center">{admin.id}</td>
                  <td className="p-2 text-xs font-medium text-center">{admin.phoneNumber.replace('+98', '0')}</td>
                  <td className="p-2 text-xs text-center">{admin.firstName}</td>
                  <td className="p-2 text-xs text-center">{admin.lastName}</td>
                  <td className="p-2 text-xs text-center">
                    {admin.email ? (
                      <span className="text-purple-400 hover:underline">{admin.email}</span>
                    ) : (
                      <span className="text-purple-300/50">-</span>
                    )}
                  </td>
                  <td className="p-2 text-xs text-center">
                    <span className="px-2 py-1 bg-purple-900/20 border border-purple-700/30 rounded-md text-xs text-purple-300 inline-block">
                      {roleOptions.find((opt) => opt.value === admin.role)?.label || admin.role}
                    </span>
                  </td>
                  <td className="p-2 text-xs text-center">
                    <div className="flex items-center gap-3 justify-center">
                      <motion.span
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`px-2 py-1 rounded-full text-xs flex items-center justify-center w-16 transition-all duration-500 ${
                          admin.isActive 
                            ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/50' 
                            : 'bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-400 border border-red-500/50'
                        }`}
                      >
                        <motion.span
                          initial={{ y: -20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          key={admin.isActive ? 'active' : 'inactive'}
                          transition={{ type: 'spring', stiffness: 500 }}
                        >
                          {admin.isActive ? 'فعال' : 'غیرفعال'}
                        </motion.span>
                      </motion.span>
                      {adminRole === 'OWNER' && (
                        <motion.button
                          onClick={async () => {
                            try {
                              const newStatus = !admin.isActive;
                              const optimisticAdmin = { ...admin, isActive: newStatus };
                              
                              // Optimistically update the UI
                              const adminIndex = admins.findIndex(a => a.id === admin.id);
                              const newAdmins = [...admins];
                              newAdmins[adminIndex] = optimisticAdmin;
                              setAdmins(newAdmins);
                              
                              const response = await fetch(`/api/admin?id=${admin.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include',
                                body: JSON.stringify({ isActive: newStatus }),
                              });
                              
                              if (response.ok) {
                                const data = await response.json();
                                if (data.success) {
                                  toast.success(data.message, {
                                    style: { 
                                      background: newStatus ? '#059669' : '#DC2626',
                                      color: '#fff',
                                      borderRadius: '1rem',
                                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                    },
                                    icon: newStatus ? '✨' : '💤',
                                    duration: 2000,
                                  });
                                }
                              } else {
                                // Revert optimistic update on error
                                const error = await response.json();
                                newAdmins[adminIndex] = admin;
                                setAdmins(newAdmins);
                                toast.error(error.error, { 
                                  style: { 
                                    background: '#DC2626', 
                                    color: '#fff',
                                    borderRadius: '1rem',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                  },
                                  icon: '⚠️',
                                  duration: 3000,
                                });
                              }
                            } catch (error) {
                              toast.error('خطا در ارتباط با سرور', { 
                                style: { 
                                  background: '#DC2626', 
                                  color: '#fff',
                                  borderRadius: '1rem',
                                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                },
                                icon: '⛔️',
                                duration: 3000,
                              });
                            }
                          }}
                          className={`group relative w-14 h-7 rounded-full transition-all duration-500 ${admin.isActive ? 'bg-gradient-to-r from-red-500 to-rose-500' : 'bg-gradient-to-r from-green-500 to-emerald-500'}`}
                          style={{
                            boxShadow: admin.isActive 
                              ? '0 0 10px rgba(239, 68, 68, 0.5), inset 0 0 15px rgba(0, 0, 0, 0.2)'
                              : '0 0 10px rgba(16, 185, 129, 0.5), inset 0 0 15px rgba(0, 0, 0, 0.2)'
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          title={admin.isActive ? 'غیرفعال کردن' : 'فعال کردن'}
                        >
                          <motion.div
                            className="absolute w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center text-sm"
                            style={{ top: '2px', left: '2px' }}
                            initial={false}
                            animate={{
                              x: admin.isActive ? 'calc(100% - 0px)' : '0px',
                              rotate: admin.isActive ? 360 : 0,
                              scale: admin.isActive ? 1 : 1
                            }}
                            transition={{ 
                              type: 'spring', 
                              stiffness: 500, 
                              damping: 25
                            }}
                          >
                            <motion.span 
                              animate={{
                                scale: [1, 1.2, 1],
                                rotate: admin.isActive ? 360 : 0
                              }}
                              transition={{ 
                                duration: 0.5,
                                ease: 'easeInOut',
                                times: [0, 0.5, 1]
                              }}
                            >
                              {admin.isActive ? '😴' : '😎'}
                            </motion.span>
                          </motion.div>
                          <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full animate-pulse"></div>
                          </div>
                        </motion.button>
                      )}
                    </div>
                  </td>
                  <td className="p-6 text-center text-purple-300/70">{new Date(admin.createdAt).toLocaleDateString('fa-IR')}</td>
                  <td className="p-2 text-xs text-center">
                    <div className="flex gap-2 justify-center">
                      {handleEdit ? (
                        // Check if the user can edit this admin
                        (adminId && canEditAdmin(admin.id, admin.role)) || 
                        (adminRole && canEditAdminRole(adminRole as AdminRoleType, admin.role as AdminRoleType)) ? (
                          <button
                            onClick={() => handleEdit(admin)}
                            className="p-2 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500 rounded-lg text-purple-400 transition-all duration-200 hover:scale-105 shadow-sm shadow-purple-500/20"
                            title="ویرایش"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                        ) : (
                          <div 
                            className="p-2 bg-gray-500/10 border border-gray-500 rounded-lg text-gray-500 cursor-not-allowed"
                            title="شما دسترسی ویرایش این ادمین را ندارید"
                          >
                            <ShieldExclamationIcon className="w-4 h-4" />
                          </div>
                        )
                      ) : null}
                      
                      {handleDelete ? (
                        // Only OWNER can delete admins
                        adminRole === 'OWNER' ? (
                          <button
                            onClick={() => handleDelete(admin.id)}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500 rounded-lg text-red-500 transition-all duration-200 hover:scale-105 shadow-sm shadow-red-500/20"
                            title="حذف"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        ) : (
                          <div 
                            className="p-2 bg-gray-500/10 border border-gray-500 rounded-lg text-gray-500 cursor-not-allowed"
                            title="فقط نقش OWNER میتواند ادمین ها را حذف کند"
                          >
                            <LockClosedIcon className="w-4 h-4" />
                          </div>
                        )
                      ) : null}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}