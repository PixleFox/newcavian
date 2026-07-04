'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  BellIcon, 
  EnvelopeIcon, 
  DevicePhoneMobileIcon,
  ShoppingCartIcon,
  ShieldExclamationIcon,
  MegaphoneIcon,
  CogIcon,
  CheckIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { AdminProfileData, NotificationSettings as NotificationSettingsType } from './types';

interface NotificationSettingsProps {
  profileData: AdminProfileData;
  onUpdate: (data: Partial<AdminProfileData>) => Promise<void>;
}

export default function NotificationSettings({ profileData, onUpdate }: NotificationSettingsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState<NotificationSettingsType>(
    profileData.notifications || {
      emailNotifications: true,
      smsNotifications: true,
      orderUpdates: true,
      securityAlerts: true,
      marketingUpdates: false,
      systemUpdates: true,
    }
  );
  
  // Handle settings change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setSettings(prev => ({ ...prev, [name]: checked }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onUpdate({ notifications: settings });
      
      toast.success('تنظیمات اعلان‌ها با موفقیت بروزرسانی شد', {
        style: { background: '#10B981', color: '#fff' },
      });
    } catch (err) {
      console.error('Error updating notification settings:', err);
      toast.error('خطا در بروزرسانی تنظیمات اعلان‌ها', {
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
          <BellIcon className="w-6 h-6 text-purple-400" />
          تنظیمات اعلان‌ها
        </h2>
      </div>
      
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-8">
        <div className="flex items-start gap-3">
          <InformationCircleIcon className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <h4 className="text-sm font-medium text-blue-400">درباره تنظیمات اعلان‌ها</h4>
            <p className="text-gray-300 text-sm mt-1">
              در این بخش می‌توانید مشخص کنید که چه نوع اعلان‌هایی را می‌خواهید دریافت کنید و از چه طریقی (ایمیل یا پیامک) به شما اطلاع‌رسانی شود.
            </p>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
          {/* Notification Channels */}
          <div className="bg-purple-900/20 border border-purple-500/20 rounded-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 mb-4 sm:mb-6">
              <BellIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
              کانال‌های اعلان
            </h3>
            
            <div className="space-y-4 sm:space-y-6">
              <motion.div 
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 bg-purple-900/30 p-3 rounded-lg"
                animate={settings.emailNotifications ? { borderColor: 'rgba(147, 51, 234, 0.3)' } : { borderColor: 'rgba(75, 85, 99, 0.3)' }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${settings.emailNotifications ? 'bg-purple-500/20' : 'bg-gray-500/20'}`}>
                    <EnvelopeIcon className={`w-4 h-4 sm:w-6 sm:h-6 ${settings.emailNotifications ? 'text-purple-400' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">اعلان‌های ایمیلی</h4>
                    <p className="text-xs text-gray-400 mt-1">
                      {profileData.email ? 
                        `ارسال اعلان‌ها به ${profileData.email}` : 
                        'دریافت اعلان‌ها از طریق ایمیل'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 self-end sm:self-auto mt-2 sm:mt-0">
                  <span className="text-xs text-gray-400">
                    {settings.emailNotifications ? 'فعال' : 'غیرفعال'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="emailNotifications"
                      checked={settings.emailNotifications} 
                      onChange={handleChange}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 bg-purple-900/30 p-3 rounded-lg"
                animate={settings.smsNotifications ? { borderColor: 'rgba(147, 51, 234, 0.3)' } : { borderColor: 'rgba(75, 85, 99, 0.3)' }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${settings.smsNotifications ? 'bg-purple-500/20' : 'bg-gray-500/20'}`}>
                    <DevicePhoneMobileIcon className={`w-4 h-4 sm:w-6 sm:h-6 ${settings.smsNotifications ? 'text-purple-400' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">اعلان‌های پیامکی</h4>
                    <p className="text-xs text-gray-400 mt-1">
                      {profileData.phoneNumber ? 
                        `ارسال اعلان‌ها به ${profileData.phoneNumber}` : 
                        'دریافت اعلان‌ها از طریق پیامک'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 self-end sm:self-auto mt-2 sm:mt-0">
                  <span className="text-xs text-gray-400">
                    {settings.smsNotifications ? 'فعال' : 'غیرفعال'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="smsNotifications"
                      checked={settings.smsNotifications} 
                      onChange={handleChange}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </motion.div>
            </div>
            
            {!profileData.email && settings.emailNotifications && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 sm:mt-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 sm:p-4"
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  <InformationCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 flex-shrink-0 mt-0.5 sm:mt-1" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-yellow-400">ایمیل ثبت نشده</h4>
                    <p className="text-xs sm:text-sm text-gray-300 mt-1">
                      شما هنوز ایمیلی ثبت نکرده‌اید. برای دریافت اعلان‌های ایمیلی، لطفاً ابتدا ایمیل خود را در بخش اطلاعات شخصی ثبت کنید.
                    </p>
                    <button 
                      type="button" 
                      className="mt-2 text-xs text-yellow-400 hover:text-yellow-300 transition-colors flex items-center gap-1"
                      onClick={() => window.location.href = '/admin/panel/profile/info'}
                    >
                      رفتن به بخش اطلاعات پروفایل
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
          
          {/* Notification Types */}
          <div className="bg-purple-900/20 border border-purple-500/20 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
              <BellIcon className="w-5 h-5 text-purple-400" />
              انواع اعلان‌ها
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <ShoppingCartIcon className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">بروزرسانی سفارش‌ها</h4>
                    <p className="text-xs text-gray-400 mt-1">
                      اعلان‌های مربوط به سفارش‌های جدید و تغییر وضعیت
                    </p>
                  </div>
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="orderUpdates"
                    checked={settings.orderUpdates} 
                    onChange={handleChange}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <ShieldExclamationIcon className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">هشدارهای امنیتی</h4>
                    <p className="text-xs text-gray-400 mt-1">
                      اعلان‌های مربوط به ورود به حساب و تغییرات امنیتی
                    </p>
                  </div>
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="securityAlerts"
                    checked={settings.securityAlerts} 
                    onChange={handleChange}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <MegaphoneIcon className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">اطلاعیه‌های بازاریابی</h4>
                    <p className="text-xs text-gray-400 mt-1">
                      اعلان‌های مربوط به تخفیف‌ها و کمپین‌های بازاریابی
                    </p>
                  </div>
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="marketingUpdates"
                    checked={settings.marketingUpdates} 
                    onChange={handleChange}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <CogIcon className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">بروزرسانی‌های سیستم</h4>
                    <p className="text-xs text-gray-400 mt-1">
                      اعلان‌های مربوط به تغییرات و بروزرسانی‌های سیستم
                    </p>
                  </div>
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="systemUpdates"
                    checked={settings.systemUpdates} 
                    onChange={handleChange}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        {/* Preview Section */}
        <div className="mt-8 bg-purple-900/20 border border-purple-500/20 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <BellIcon className="w-5 h-5 text-purple-400" />
            پیش‌نمایش اعلان‌ها
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settings.emailNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <EnvelopeIcon className="w-5 h-5 text-purple-400" />
                  <h4 className="text-sm font-medium text-purple-300">نمونه اعلان ایمیلی</h4>
                </div>
                <div className="bg-gray-800 rounded-lg p-3 text-xs text-gray-300 dir-ltr">
                  <p><strong>From:</strong> Cavian Notifications &lt;notifications@cavian.com&gt;</p>
                  <p><strong>To:</strong> {profileData.email || 'your.email@example.com'}</p>
                  <p><strong>Subject:</strong> New Order Received (#12345)</p>
                  <hr className="my-2 border-gray-700" />
                  <p>A new order has been placed on your store. Order #12345 requires your attention.</p>
                  <p className="mt-2">View order details: <span className="text-purple-400">https://cavian.com/admin/orders/12345</span></p>
                </div>
              </motion.div>
            )}
            
            {settings.smsNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <DevicePhoneMobileIcon className="w-5 h-5 text-purple-400" />
                  <h4 className="text-sm font-medium text-purple-300">نمونه اعلان پیامکی</h4>
                </div>
                <div className="bg-gray-800 rounded-lg p-3 text-xs text-gray-300">
                  <p className="dir-ltr">Cavian: New order #12345 received. Login to admin panel to view details.</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg flex items-center gap-2 transition-colors"
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
      </form>
    </div>
  );
}
