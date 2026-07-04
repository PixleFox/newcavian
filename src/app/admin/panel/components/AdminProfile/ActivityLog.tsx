'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  ClockIcon, 
  ArrowPathIcon,
  GlobeAltIcon,
  ComputerDesktopIcon,
  KeyIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  ShoppingCartIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { AdminProfileData, ActivityLogEntry } from './types';

interface ActivityLogProps {
  profileData: AdminProfileData;
}

export default function ActivityLog({ profileData }: ActivityLogProps) {
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>(
    profileData.activityLog || []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  
  // Generate mock activity log data
  useEffect(() => {
    const generateMockActivityLog = () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Create mock activity log entries
        const now = new Date();
        const mockEntries: ActivityLogEntry[] = [
          {
            id: 1,
            action: 'login',
            timestamp: new Date(now.getTime() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
            ipAddress: '127.0.0.1',
            userAgent: 'Chrome/112.0.0.0',
            details: 'ورود موفق به پنل ادمین',
          },
          {
            id: 2,
            action: 'profile_update',
            timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
            ipAddress: '127.0.0.1',
            userAgent: 'Chrome/112.0.0.0',
            details: 'بروزرسانی اطلاعات پروفایل',
          },
          {
            id: 3,
            action: 'password_change',
            timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
            ipAddress: '127.0.0.1',
            userAgent: 'Chrome/112.0.0.0',
            details: 'تغییر رمز عبور',
          },
          {
            id: 4,
            action: 'order_view',
            timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
            ipAddress: '127.0.0.1',
            userAgent: 'Chrome/112.0.0.0',
            details: 'مشاهده سفارش #1234',
          },
          {
            id: 5,
            action: 'login',
            timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
            ipAddress: '127.0.0.1',
            userAgent: 'Firefox/98.0',
            details: 'ورود موفق به پنل ادمین',
          },
        ];
        
        setActivityLog(mockEntries);
      } catch (err) {
        console.error('Error generating mock activity log:', err);
        setError('خطا در بارگذاری گزارش فعالیت‌ها');
      } finally {
        setIsLoading(false);
      }
    };
    
    generateMockActivityLog();
  }, []);
  
  // Get icon for activity type
  const getActivityIcon = (action: string) => {
    const iconMap: Record<string, any> = {
      'login': ComputerDesktopIcon,
      'logout': ComputerDesktopIcon,
      'password_change': KeyIcon,
      'profile_update': UserCircleIcon,
      'security_setting_change': ShieldCheckIcon,
      'order_view': ShoppingCartIcon,
      'order_update': ShoppingCartIcon,
      'admin_create': UserCircleIcon,
      'admin_update': UserCircleIcon,
      'admin_delete': UserCircleIcon,
    };
    
    // Extract the base action type (before the underscore)
    const baseAction = action.split('_')[0];
    
    return iconMap[action] || iconMap[baseAction] || ClockIcon;
  };
  
  // Filter and sort activities
  const filteredActivities = activityLog
    .filter(activity => {
      // Filter by type
      if (filterType !== 'all' && !activity.action.includes(filterType)) {
        return false;
      }
      
      // Filter by search term
      if (searchTerm && !activity.action.includes(searchTerm.toLowerCase()) && 
          !activity.details?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  
  // Pagination
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const paginatedActivities = filteredActivities.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  
  // Format date and time
  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  
  // Get readable action name
  const getActionName = (action: string) => {
    const actionMap: Record<string, string> = {
      'login': 'ورود به سیستم',
      'logout': 'خروج از سیستم',
      'password_change': 'تغییر رمز عبور',
      'profile_update': 'بروزرسانی پروفایل',
      'security_setting_change': 'تغییر تنظیمات امنیتی',
      'order_view': 'مشاهده سفارش',
      'order_update': 'بروزرسانی سفارش',
      'admin_create': 'ایجاد ادمین جدید',
      'admin_update': 'بروزرسانی ادمین',
      'admin_delete': 'حذف ادمین',
    };
    
    return actionMap[action] || action;
  };
  
  // Handle refresh - generate new mock data
  const handleRefresh = () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Create mock activity log entries with current timestamp
      const now = new Date();
      const mockEntries: ActivityLogEntry[] = [
        ...activityLog,
        {
          id: activityLog.length + 1,
          action: 'login',
          timestamp: now.toISOString(),
          ipAddress: '127.0.0.1',
          userAgent: 'Chrome/112.0.0.0',
          details: 'بازیابی اطلاعات جدید',
        }
      ];
      
      // Sort by timestamp (newest first)
      mockEntries.sort((a, b) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
      
      setActivityLog(mockEntries);
      
      // Show success message
      toast.success('گزارش فعالیت‌ها با موفقیت بروزرسانی شد', {
        style: { background: '#10B981', color: '#fff' },
      });
    } catch (err) {
      console.error('Error generating mock activity log:', err);
      setError('خطا در بارگذاری گزارش فعالیت‌ها');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ClockIcon className="w-6 h-6 text-purple-400" />
          گزارش فعالیت‌ها
        </h2>
        
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg flex items-center gap-2 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-purple-300 border-t-transparent rounded-full animate-spin" />
            ) : (
              <ArrowPathIcon className="w-5 h-5" />
            )}
            بروزرسانی
          </motion.button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-purple-900/20 border border-purple-500/20 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-300 mb-1">
              جستجو
            </label>
            <div className="relative">
              <input
                type="text"
                id="searchTerm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pr-10 bg-purple-900/30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="جستجو در فعالیت‌ها..."
              />
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>
          
          <div className="w-full md:w-48">
            <label htmlFor="filterType" className="block text-sm font-medium text-gray-300 mb-1">
              نوع فعالیت
            </label>
            <select
              id="filterType"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 bg-purple-900/30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            >
              <option value="all">همه فعالیت‌ها</option>
              <option value="login">ورود و خروج</option>
              <option value="password">رمز عبور</option>
              <option value="profile">پروفایل</option>
              <option value="security">امنیت</option>
              <option value="order">سفارش‌ها</option>
              <option value="admin">مدیریت ادمین‌ها</option>
            </select>
          </div>
          
          <div className="w-full md:w-48">
            <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-300 mb-1">
              ترتیب نمایش
            </label>
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="w-full px-4 py-2 bg-purple-900/30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all flex items-center justify-between"
            >
              {sortOrder === 'desc' ? 'جدیدترین' : 'قدیمی‌ترین'}
              {sortOrder === 'desc' ? (
                <ChevronDownIcon className="w-5 h-5" />
              ) : (
                <ChevronUpIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Activity List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg text-purple-300">در حال بارگذاری فعالیت‌ها...</p>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 p-6 rounded-lg border border-red-500/30 text-center">
          <h3 className="text-xl font-bold text-red-400 mb-2">خطا در بارگذاری فعالیت‌ها</h3>
          <p className="text-gray-300">{error}</p>
          <button 
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg flex items-center gap-2 transition-all mx-auto"
          >
            <ArrowPathIcon className="w-5 h-5" />
            تلاش مجدد
          </button>
        </div>
      ) : paginatedActivities.length === 0 ? (
        <div className="bg-blue-500/10 p-6 rounded-lg border border-blue-500/30 text-center">
          <h3 className="text-xl font-bold text-blue-400 mb-2">فعالیتی یافت نشد</h3>
          <p className="text-gray-300">
            {searchTerm || filterType !== 'all' 
              ? 'هیچ فعالیتی با فیلترهای انتخاب شده یافت نشد.' 
              : 'هنوز هیچ فعالیتی ثبت نشده است.'}
          </p>
          {(searchTerm || filterType !== 'all') && (
            <button 
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
              }}
              className="mt-4 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg flex items-center gap-2 transition-all mx-auto"
            >
              <ArrowPathIcon className="w-5 h-5" />
              حذف فیلترها
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedActivities.map((activity, index) => {
            const ActivityIcon = getActivityIcon(activity.action);
            
            return (
              <motion.div 
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-purple-900/20 border border-purple-500/20 rounded-lg p-4 hover:bg-purple-900/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <ActivityIcon className="w-6 h-6 text-purple-400" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <h4 className="text-white font-medium">
                        {getActionName(activity.action)}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <ClockIcon className="w-4 h-4" />
                        <span>{formatDateTime(activity.timestamp)}</span>
                      </div>
                    </div>
                    
                    {activity.details && (
                      <p className="text-gray-300 mt-2 text-sm">
                        {activity.details}
                      </p>
                    )}
                    
                    <div className="mt-3 flex flex-wrap gap-3 text-xs">
                      <div className="bg-purple-900/30 px-2 py-1 rounded-md flex items-center gap-1">
                        <GlobeAltIcon className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-300 dir-ltr">{activity.ipAddress}</span>
                      </div>
                      
                      <div className="bg-purple-900/30 px-2 py-1 rounded-md flex items-center gap-1">
                        <ComputerDesktopIcon className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-300 truncate max-w-[200px]" title={activity.userAgent}>
                          {activity.userAgent.split(' ')[0]}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 bg-purple-900/30 border border-purple-500/30 rounded-lg text-purple-300 hover:bg-purple-900/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  قبلی
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      pageNum === page
                        ? 'bg-purple-600 text-white font-bold'
                        : 'bg-purple-900/30 border border-purple-500/30 text-purple-300 hover:bg-purple-900/40'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
                
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 bg-purple-900/30 border border-purple-500/30 rounded-lg text-purple-300 hover:bg-purple-900/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  بعدی
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Info Section */}
      <div className="mt-8 bg-blue-900/20 border border-blue-500/20 rounded-lg p-4">
        <h3 className="text-blue-300 font-medium flex items-center gap-2 mb-2">
          <InformationCircleIcon className="w-5 h-5" />
          درباره گزارش فعالیت‌ها
        </h3>
        <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
          <li>این گزارش شامل تمام فعالیت‌های شما در پنل ادمین است.</li>
          <li>فعالیت‌ها به مدت 90 روز در سیستم ذخیره می‌شوند.</li>
          <li>برای امنیت بیشتر، فعالیت‌های مشکوک را بررسی کنید.</li>
          <li>در صورت مشاهده فعالیت‌های ناشناس، سریعاً رمز عبور خود را تغییر دهید.</li>
        </ul>
      </div>
    </div>
  );
}
