'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  TagIcon,
  HeartIcon,
  LifebuoyIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

const menus = [
  { id: 'dashboard', label: 'داشبورد',            icon: HomeIcon },
  { id: 'orders',    label: 'سفارش‌ها',           icon: ClipboardDocumentListIcon },
  { id: 'profile',   label: 'پروفایل',            icon: UserIcon },
  { id: 'coupons',   label: 'کوپن‌ها',            icon: TagIcon },
  { id: 'wishlist',  label: 'لیست علاقه‌مندی‌ها', icon: HeartIcon },
  { id: 'support',   label: 'پشتیبانی',           icon: LifebuoyIcon },
];

export default function UserSidebar({
  activeTab,
  setActiveTab,
  handleLogout,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleLogout: () => Promise<void>;
}) {
  const router = useRouter();

  const onLogout = async () => {
    try {
      await handleLogout();
      router.push('/user/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <motion.nav
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      className="hidden md:flex flex-col h-screen w-64 bg-surface border-s border-border p-6 fixed right-0 top-0 z-50"
    >
      {/* Header */}
      <div className="mb-8 border-b border-border pb-6">
        <h1 className="text-2xl font-bold text-primary">پنل کاربری</h1>
      </div>

      {/* Menu Items */}
      <div className="flex-1 space-y-1 overflow-y-auto">
        {menus.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-right transition-colors duration-150 ${
                isActive
                  ? 'bg-primary text-primary-fg'
                  : 'text-muted hover:bg-surface-2 hover:text-fg'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-fg' : 'text-primary'}`} />
              <span className="text-sm font-medium">{item.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="mt-4 flex items-center gap-3 px-3 py-2.5 rounded-lg text-error hover:bg-error/10 transition-colors duration-150"
      >
        <ArrowLeftOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
        <span className="text-sm font-medium">خروج از حساب</span>
      </button>
    </motion.nav>
  );
}
