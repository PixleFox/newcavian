'use client';

import { motion } from 'framer-motion';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  TagIcon,
  HeartIcon,
  LifebuoyIcon,
} from '@heroicons/react/24/outline';

const menus = [
  { id: 'dashboard', label: 'داشبورد',  icon: HomeIcon },
  { id: 'orders',    label: 'سفارش‌ها', icon: ClipboardDocumentListIcon },
  { id: 'profile',   label: 'پروفایل',  icon: UserIcon },
  { id: 'wishlist',  label: 'علاقه‌ها',  icon: HeartIcon },
  { id: 'support',   label: 'پشتیبانی', icon: LifebuoyIcon },
];

export default function UserMobileMenu({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-50 md:hidden safe-area-pb">
      <div className="flex justify-around items-center px-2 py-1">
        {menus.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.88 }}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors duration-150 min-w-0"
            >
              <div className={`p-1.5 rounded-lg transition-colors duration-150 ${
                isActive ? 'bg-primary/15' : ''
              }`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-subtle'}`} />
              </div>
              <span className={`text-[10px] font-medium truncate ${isActive ? 'text-primary' : 'text-subtle'}`}>
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
