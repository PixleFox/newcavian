'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  ShieldCheckIcon, 
  KeyIcon, 
  ClockIcon,
  LockClosedIcon,
  InformationCircleIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { AdminProfileData, PasswordChangeRequest, SecuritySettings as SecuritySettingsType } from './types';

interface SecuritySettingsProps {
  profileData: AdminProfileData;
  onUpdate: (data: Partial<AdminProfileData>) => Promise<void>;
}

export default function SecuritySettings({ profileData, onUpdate }: SecuritySettingsProps) {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [securitySettings, setSecuritySettings] = useState<SecuritySettingsType>(
    profileData.securitySettings || {
      lastPasswordChange: profileData.createdAt,
      sessionTimeout: 60,
      loginNotifications: true,
      allowedIPs: [],
    }
  );
  
  // Security settings state management
  
  // Handle password input change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle security settings change
  const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setSecuritySettings(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value, 10) : newValue,
    }));
  };
  
  // Handle password form submission
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('لطفاً تمام فیلدها را پر کنید', {
        style: { background: '#EF4444', color: '#fff' },
      });
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('رمز عبور جدید و تکرار آن مطابقت ندارند', {
        style: { background: '#EF4444', color: '#fff' },
      });
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      toast.error('رمز عبور جدید باید حداقل ۸ کاراکتر باشد', {
        style: { background: '#EF4444', color: '#fff' },
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Use the reset-password API endpoint
      const response = await fetch('/api/admin/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'خطا در تغییر رمز عبور');
      }
      
      // Update last password change time
      const updatedSettings = {
        ...securitySettings,
        lastPasswordChange: new Date().toISOString(),
      };
      
      await onUpdate({ 
        securitySettings: updatedSettings 
      });
      
      setSecuritySettings(updatedSettings);
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      toast.success('رمز عبور با موفقیت تغییر یافت', {
        style: { background: '#10B981', color: '#fff' },
      });
    } catch (err) {
      console.error('Error changing password:', err);
      toast.error((err as Error).message || 'خطا در تغییر رمز عبور', {
        style: { background: '#EF4444', color: '#fff' },
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle security settings submission
  const handleSecuritySettingsSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Just update the UI state - no backend API available for this
      await onUpdate({ securitySettings });
      
      // Log the change for debugging
      console.log('Session timeout updated to:', securitySettings.sessionTimeout, 'minutes');
      
      toast.success('تنظیمات امنیتی با موفقیت بروزرسانی شد', {
        style: { background: '#10B981', color: '#fff' },
      });
    } catch (err) {
      console.error('Error updating security settings:', err);
      toast.error('خطا در بروزرسانی تنظیمات امنیتی', {
        style: { background: '#EF4444', color: '#fff' },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldCheckIcon className="w-6 h-6 text-purple-400" />
          تنظیمات امنیتی
        </h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Password Section */}
        <div className="bg-purple-900/20 border border-purple-500/20 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <KeyIcon className="w-5 h-5 text-purple-400" />
            مدیریت رمز عبور
          </h3>
          
          {isChangingPassword ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300">
                  رمز عبور فعلی <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  placeholder="رمز عبور فعلی خود را وارد کنید"
                  dir="ltr"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300">
                  رمز عبور جدید <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  placeholder="رمز عبور جدید را وارد کنید"
                  dir="ltr"
                />
                <p className="text-xs text-gray-400">
                  رمز عبور باید حداقل ۸ کاراکتر باشد
                </p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                  تکرار رمز عبور جدید <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  placeholder="رمز عبور جدید را مجدداً وارد کنید"
                  dir="ltr"
                />
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsChangingPassword(false)}
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
                      تغییر رمز عبور
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ClockIcon className="w-5 h-5 text-purple-400" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-300">آخرین تغییر رمز عبور</h4>
                    <p className="text-white">
                      {securitySettings.lastPasswordChange 
                        ? new Date(securitySettings.lastPasswordChange).toLocaleDateString('fa-IR')
                        : 'ثبت نشده'}
                    </p>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsChangingPassword(true)}
                  className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <KeyIcon className="w-5 h-5" />
                  تغییر رمز عبور
                </motion.button>
              </div>
              
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-400">توصیه امنیتی</h4>
                    <p className="text-gray-300 text-sm mt-1">
                      توصیه می‌شود هر ۳ ماه یکبار رمز عبور خود را تغییر دهید. از رمزهای عبور قوی استفاده کنید که شامل حروف بزرگ و کوچک، اعداد و نمادها باشند.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Security Information */}
        <div className="bg-purple-900/20 border border-purple-500/20 rounded-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 mb-3 sm:mb-4">
            <InformationCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            نکات امنیتی
          </h3>
          
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <InformationCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0 mt-0.5 sm:mt-1" />
              <div>
                <h4 className="text-xs sm:text-sm font-medium text-blue-400">توصیه‌های امنیتی</h4>
                <p className="text-xs sm:text-sm text-gray-300 mt-1">
                  برای حفظ امنیت حساب خود، از رمزهای عبور قوی استفاده کنید و آنها را به صورت دوره‌ای تغییر دهید.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Additional Security Settings */}
        <div className="bg-purple-900/20 border border-purple-500/20 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <LockClosedIcon className="w-5 h-5 text-purple-400" />
            تنظیمات پیشرفته امنیتی
          </h3>
          
          <div className="space-y-6">

            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-300">اعلان‌های ورود</h4>
                <p className="text-xs text-gray-400 mt-1">
                  دریافت اعلان هنگام ورود به حساب کاربری
                </p>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="loginNotifications"
                  checked={securitySettings.loginNotifications} 
                  onChange={handleSettingChange}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSecuritySettingsSubmit}
              className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg flex items-center gap-2 transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-purple-300 border-t-transparent rounded-full animate-spin" />
                  در حال ذخیره...
                </>
              ) : (
                <>
                  <CheckIcon className="w-5 h-5" />
                  ذخیره تنظیمات
                </>
              )}
            </motion.button>
          </div>
        </div>
        
        {/* Active Sessions */}
        <div className="bg-purple-900/20 border border-purple-500/20 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <ComputerDesktopIcon className="w-5 h-5 text-purple-400" />
            نشست‌های فعال
          </h3>
          
          <div className="space-y-4">
            <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <ComputerDesktopIcon className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">نشست فعلی</h4>
                    <p className="text-xs text-gray-400">
                      دستگاه فعلی • آخرین فعالیت: اکنون
                    </p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                  فعال
                </span>
              </div>
            </div>
            
            <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-4 opacity-60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-500/20 flex items-center justify-center">
                    <GlobeAltIcon className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">مرورگر دیگر</h4>
                    <p className="text-xs text-gray-400">
                      Chrome • Windows • آخرین فعالیت: دیروز
                    </p>
                  </div>
                </div>
                <button className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full hover:bg-red-500/30 transition-colors">
                  خروج
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <button className="text-red-400 text-sm hover:text-red-300 transition-colors">
              خروج از تمام دستگاه‌ها
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
