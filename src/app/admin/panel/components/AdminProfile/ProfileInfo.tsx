'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  UserCircleIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { AdminProfileData, ProfileUpdateRequest } from './types';

interface ProfileInfoProps {
  profileData: AdminProfileData;
  onUpdate: (data: Partial<AdminProfileData>) => Promise<void>;
}

export default function ProfileInfo({ profileData, onUpdate }: ProfileInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: profileData.firstName,
    lastName: profileData.lastName,
    email: profileData.email || '',
  });
  
  // Format phone number to local format (09XXXXXXXXX)
  const formatPhoneNumber = (phone: string): string => {
    // Remove any non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Check if it starts with +98
    if (phone.startsWith('+98')) {
      return '0' + phone.substring(3);
    }
    
    // Check if it's a 10-digit number starting with 9
    if (digits.length === 10 && digits.startsWith('9')) {
      return '0' + digits;
    }
    
    // If it already starts with 0, return as is
    if (digits.startsWith('0')) {
      return digits;
    }
    
    // Default case
    return phone;
  };
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error('نام و نام خانوادگی نمی‌تواند خالی باشد', {
        style: { background: '#EF4444', color: '#fff' },
      });
      return;
    }
    
    // Email validation (if provided)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('فرمت ایمیل صحیح نیست', {
        style: { background: '#EF4444', color: '#fff' },
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create a profile update request with the correct types
      const updateData: ProfileUpdateRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email || undefined, // Use undefined instead of null to match the expected type
      };
      
      // Convert to AdminProfileData partial for the onUpdate function
      await onUpdate(updateData as Partial<AdminProfileData>);
      setIsEditing(false);
      toast.success('اطلاعات شخصی با موفقیت بروزرسانی شد', {
        style: { background: '#10B981', color: '#fff' },
      });
    } catch (error) {
      console.error('Error updating profile info:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Cancel editing and reset form
  const handleCancel = () => {
    setFormData({
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      email: profileData.email || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <UserCircleIcon className="w-6 h-6 text-purple-400" />
          اطلاعات شخصی
        </h2>
        
        {!isEditing && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg flex items-center gap-2 transition-colors"
          >
            <PencilIcon className="w-5 h-5" />
            ویرایش اطلاعات
          </motion.button>
        )}
      </div>
      
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-300">
                نام <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="نام خود را وارد کنید"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-300">
                نام خانوادگی <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="نام خانوادگی خود را وارد کنید"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-300">
                شماره موبایل
              </label>
              <input
                type="text"
                id="phoneNumber"
                value={profileData.phoneNumber}
                disabled
                className="w-full px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-lg text-gray-400 cursor-not-allowed"
                dir="ltr"
              />
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <InformationCircleIcon className="w-4 h-4" />
                شماره موبایل قابل ویرایش نیست
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                ایمیل
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="ایمیل خود را وارد کنید"
                dir="ltr"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCancel}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg flex items-center gap-2 transition-colors"
              disabled={isSubmitting}
            >
              <XMarkIcon className="w-5 h-5" />
              انصراف
            </motion.button>
            
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-300 rounded-lg flex items-center gap-2 transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-green-300 border-t-transparent rounded-full animate-spin" />
                  در حال ذخیره...
                </>
              ) : (
                <>
                  <CheckIcon className="w-5 h-5" />
                  ذخیره تغییرات
                </>
              )}
            </motion.button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-purple-900/20 border border-purple-500/20 rounded-lg p-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <UserCircleIcon className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-medium text-purple-300">نام و نام خانوادگی</h3>
            </div>
            <p className="text-white text-lg font-bold">
              {profileData.firstName} {profileData.lastName}
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-purple-900/20 border border-purple-500/20 rounded-lg p-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <PhoneIcon className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-medium text-purple-300">شماره موبایل</h3>
            </div>
            <p className="text-white text-lg font-bold dir-ltr text-center">
              {formatPhoneNumber(profileData.phoneNumber)}
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-purple-900/20 border border-purple-500/20 rounded-lg p-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <EnvelopeIcon className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-medium text-purple-300">ایمیل</h3>
            </div>
            <p className="text-white text-lg font-bold dir-ltr text-center">
              {profileData.email || 'ثبت نشده'}
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="bg-purple-900/20 border border-purple-500/20 rounded-lg p-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <InformationCircleIcon className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-medium text-purple-300">نقش کاربری</h3>
            </div>
            <p className="text-white text-lg font-bold">
              {profileData.role === 'OWNER' && 'مالک'}
              {profileData.role === 'MANAGER' && 'مدیر'}
              {profileData.role === 'SELLER' && 'فروشنده'}
              {profileData.role === 'MARKETER' && 'بازاریاب'}
              {profileData.role === 'OPERATOR' && 'اپراتور'}
            </p>
          </motion.div>
        </div>
      )}
      
      {/* Tips Section */}
      <div className="mt-8 bg-blue-900/20 border border-blue-500/20 rounded-lg p-4">
        <h3 className="text-blue-300 font-medium flex items-center gap-2 mb-2">
          <InformationCircleIcon className="w-5 h-5" />
          نکات مهم
        </h3>
        <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
          <li>اطلاعات شخصی شما با دیگر ادمین‌های سیستم به اشتراک گذاشته می‌شود.</li>
          <li>برای تغییر شماره موبایل با پشتیبانی تماس بگیرید.</li>
          <li>ایمیل خود را برای دریافت اعلان‌های مهم به‌روز نگه دارید.</li>
        </ul>
      </div>
    </div>
  );
}
