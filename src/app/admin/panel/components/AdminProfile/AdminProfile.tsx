'use client';
import { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { Toaster, toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCircleIcon, 
  ShieldCheckIcon, 
  BellIcon, 
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { usePermissions } from '@/hooks/usePermissions';

// Import components
import ProfileHeader from './ProfileHeader';
import ProfileInfo from './ProfileInfo';
import SecuritySettings from './SecuritySettings';
import NotificationSettings from './NotificationSettings';
import ActivityLog from './ActivityLog';
import { AdminProfileData } from './types';

export default function AdminProfile() {
  const { adminId } = usePermissions();
  const [profileData, setProfileData] = useState<AdminProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch admin profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Use the new /api/admin/profile endpoint to get complete admin data including email
        const response = await fetch('/api/admin/profile', {
          method: 'GET',
          credentials: 'include', // Ensure cookies are sent
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'خطا در بارگذاری پروفایل');
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'خطا در بارگذاری پروفایل');
        }
        
        // Create a profile data object from the API response
        const adminData = data.data;
        setProfileData({
          id: adminData.id,
          phoneNumber: adminData.phoneNumber,
          firstName: adminData.firstName,
          lastName: adminData.lastName,
          email: adminData.email || '',  // This should now have the correct email from the database
          role: adminData.role,
          isActive: adminData.isActive,
          createdAt: adminData.createdAt,
          lastLogin: adminData.lastLoginAt || new Date().toISOString(),
          // Default values for other properties
          notifications: {
            emailNotifications: true,
            smsNotifications: true,
            orderUpdates: true,
            securityAlerts: true,
            marketingUpdates: false,
            systemUpdates: true,
          },
          securitySettings: {
            lastPasswordChange: adminData.createdAt,
            sessionTimeout: 60,
            loginNotifications: true,
          },
          activityLog: [],
        });
        
        console.log('Complete profile data loaded with email:', adminData.email);  // Debug log
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError((err as Error).message || 'خطا در بارگذاری پروفایل');
        toast.error('خطا در بارگذاری اطلاعات پروفایل', {
          style: { background: '#EF4444', color: '#fff' },
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
  }, [refreshTrigger]);

  // Handle profile update
  const handleProfileUpdate = async (updatedData: Partial<AdminProfileData>) => {
    if (!profileData) return;
    
    // Optimistic update for UI
    setProfileData({ ...profileData, ...updatedData });
    
    try {
      // For basic profile info (firstName, lastName, email), use the main admin API
      if (updatedData.firstName || updatedData.lastName || updatedData.email) {
        const response = await fetch(`/api/admin?id=${profileData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            firstName: updatedData.firstName || profileData.firstName,
            lastName: updatedData.lastName || profileData.lastName,
            email: updatedData.email || profileData.email || '',
            phoneNumber: profileData.phoneNumber, // Required by API
            role: profileData.role, // Required by API
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'خطا در بروزرسانی پروفایل');
        }
      }
      
      // For now, other updates (notifications, security settings, etc.) are just stored locally
      // In a real app, these would have their own API endpoints
      
      toast.success('پروفایل با موفقیت بروزرسانی شد', {
        style: { background: '#10B981', color: '#fff' },
      });
      
      // Refresh data to ensure we have the latest from server
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('خطا در بروزرسانی پروفایل', {
        style: { background: '#EF4444', color: '#fff' },
      });
      
      // Revert optimistic update
      setRefreshTrigger(prev => prev + 1);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
        <div className="w-24 h-24 relative">
          <div className="absolute inset-0 rounded-full border-t-4 border-purple-500 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <UserCircleIcon className="w-12 h-12 text-purple-400" />
          </div>
        </div>
        <p className="mt-4 text-lg text-purple-300">در حال بارگذاری پروفایل...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
        <div className="bg-red-500/10 p-6 rounded-lg border border-red-500/30 max-w-md">
          <h3 className="text-xl font-bold text-red-400 mb-2">خطا در بارگذاری پروفایل</h3>
          <p className="text-gray-300">{error}</p>
          <button 
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg flex items-center gap-2 transition-all duration-300"
          >
            <ArrowPathIcon className="w-5 h-5" />
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  // No profile data
  if (!profileData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
        <div className="bg-yellow-500/10 p-6 rounded-lg border border-yellow-500/30 max-w-md">
          <h3 className="text-xl font-bold text-yellow-400 mb-2">پروفایل یافت نشد</h3>
          <p className="text-gray-300">اطلاعات پروفایل شما در دسترس نیست.</p>
          <button 
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            className="mt-4 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-lg flex items-center gap-2 transition-all duration-300"
          >
            <ArrowPathIcon className="w-5 h-5" />
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Toaster position="top-center" />
      
      {/* Profile Header */}
      <ProfileHeader 
        profileData={profileData} 
        onUpdate={handleProfileUpdate} 
      />
      
      {/* Tabs */}
      <div className="mt-8">
        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <Tab.List className="flex p-1 space-x-1 bg-purple-900/20 rounded-xl overflow-hidden border border-purple-500/20">
            {[
              { name: 'اطلاعات شخصی', icon: UserCircleIcon },
              { name: 'امنیت', icon: ShieldCheckIcon },
              { name: 'اعلان‌ها', icon: BellIcon },
              { name: 'فعالیت‌ها', icon: ClockIcon },
            ].map((tab, index) => (
              <Tab
                key={index}
                className={({ selected }) => `
                  w-full py-3 px-4 text-sm font-medium leading-5 text-white
                  rounded-lg flex items-center justify-center gap-2
                  focus:outline-none focus:ring-2 ring-offset-2 ring-offset-purple-900 ring-purple-500
                  transition-all duration-300
                  ${selected 
                    ? 'bg-gradient-to-br from-purple-600 to-purple-800 shadow-lg shadow-purple-500/30' 
                    : 'hover:bg-purple-800/40'}
                `}
              >
                <tab.icon className="w-5 h-5" />
                {tab.name}
              </Tab>
            ))}
          </Tab.List>
          
          <Tab.Panels className="mt-6">
            <AnimatePresence mode="wait">
              <Tab.Panel
                as={motion.div}
                key="profile-info"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="rounded-xl bg-purple-900/10 p-6 border border-purple-500/20"
              >
                <ProfileInfo 
                  profileData={profileData} 
                  onUpdate={handleProfileUpdate} 
                />
              </Tab.Panel>
              
              <Tab.Panel
                as={motion.div}
                key="security"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="rounded-xl bg-purple-900/10 p-6 border border-purple-500/20"
              >
                <SecuritySettings 
                  profileData={profileData} 
                  onUpdate={handleProfileUpdate} 
                />
              </Tab.Panel>
              
              <Tab.Panel
                as={motion.div}
                key="notifications"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="rounded-xl bg-purple-900/10 p-6 border border-purple-500/20"
              >
                <NotificationSettings 
                  profileData={profileData} 
                  onUpdate={handleProfileUpdate} 
                />
              </Tab.Panel>
              
              <Tab.Panel
                as={motion.div}
                key="activity"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="rounded-xl bg-purple-900/10 p-6 border border-purple-500/20"
              >
                <ActivityLog profileData={profileData} />
              </Tab.Panel>
            </AnimatePresence>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
}
