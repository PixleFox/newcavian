'use client';
import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { usePermissions } from '@/hooks/usePermissions';

// Lazy load icons for better performance
const HomeIcon = dynamic(() => import('@heroicons/react/24/outline').then(mod => mod.HomeIcon), {
  loading: () => <IconLoading />,
  ssr: false
});
const ClipboardDocumentListIcon = dynamic(() => import('@heroicons/react/24/outline').then(mod => mod.ClipboardDocumentListIcon), {
  loading: () => <IconLoading />,
  ssr: false
});
const ShoppingCartIcon = dynamic(() => import('@heroicons/react/24/outline').then(mod => mod.ShoppingCartIcon), {
  loading: () => <IconLoading />,
  ssr: false
});
const UsersIcon = dynamic(() => import('@heroicons/react/24/outline').then(mod => mod.UsersIcon), {
  loading: () => <IconLoading />,
  ssr: false
});
const UserCircleIcon = dynamic(() => import('@heroicons/react/24/outline').then(mod => mod.UserCircleIcon), {
  loading: () => <IconLoading />,
  ssr: false
});
const CommandLineIcon = dynamic(() => import('@heroicons/react/24/outline').then(mod => mod.CommandLineIcon), {
  loading: () => <IconLoading />,
  ssr: false
});
const ChatBubbleLeftRightIcon = dynamic(() => import('@heroicons/react/24/outline').then(mod => mod.ChatBubbleLeftRightIcon), {
  loading: () => <IconLoading />,
  ssr: false
});
const TagIcon = dynamic(() => import('@heroicons/react/24/outline').then(mod => mod.TagIcon), {
  loading: () => <IconLoading />,
  ssr: false
});
const ArrowLeftOnRectangleIcon = dynamic(() => import('@heroicons/react/24/outline').then(mod => mod.ArrowLeftOnRectangleIcon), {
  loading: () => <IconLoading />,
  ssr: false
});
const EllipsisVerticalIcon = dynamic(() => import('@heroicons/react/24/outline').then(mod => mod.EllipsisVerticalIcon), {
  loading: () => <IconLoading />,
  ssr: false
});

const EllipsisHorizontalIcon = dynamic(() => import('@heroicons/react/24/outline').then(mod => mod.EllipsisHorizontalIcon), {
  loading: () => <IconLoading />,
  ssr: false
});
const PhotoIcon = dynamic(() => import('@heroicons/react/24/outline').then(mod => mod.PhotoIcon), {
  loading: () => <IconLoading />,
  ssr: false
});
const RectangleGroupIcon = dynamic(() => import('@heroicons/react/24/outline').then(mod => mod.RectangleGroupIcon), {
  loading: () => <IconLoading />,
  ssr: false
});

// Loading fallback for icons
const IconLoading = () => (
  <div className="w-6 h-6 rounded-full bg-purple-500/20 animate-pulse" />
);

// Custom hook for localStorage persistence
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}

export default function NuclearSidebar({
  activeTab,
  setActiveTab,
  handleLogout,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleLogout: () => Promise<void>;
}) {
  const router = useRouter();
  const { adminRole } = usePermissions();
  const [isCollapsed, setIsCollapsed] = useLocalStorage('sidebarCollapsed', false);
  const [loadingSection, setLoadingSection] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  // Pre-fetch routes for faster navigation
  useEffect(() => {
    const prefetchRoutes = async () => {
      const routes = ['/admin/panel', '/admin/login'];
      for (const route of routes) {
        await router.prefetch(route);
      }
    };
    prefetchRoutes();
  }, [router]);

  const menus = [
    { id: 'dashboard', label: 'داشبورد', icon: HomeIcon, roles: ['OWNER', 'MANAGER', 'SELLER', 'MARKETER', 'OPERATOR'] },
    { id: 'orders', label: 'سفارشات', icon: ClipboardDocumentListIcon, roles: ['OWNER', 'MANAGER', 'SELLER'] },
    { id: 'products', label: 'محصولات', icon: ShoppingCartIcon, roles: ['OWNER', 'MANAGER', 'SELLER'] },
    { id: 'users', label: 'کاربران', icon: UsersIcon, roles: ['OWNER', 'MANAGER'] },
    { id: 'admins', label: 'ادمین‌ها', icon: CommandLineIcon, roles: ['OWNER'] },
    { id: 'collections', label: 'کالکشن‌ها', icon: RectangleGroupIcon, roles: ['OWNER', 'MANAGER'] },
    { id: 'discounts', label: 'تخفیف‌ها', icon: TagIcon, roles: ['OWNER', 'MANAGER'] },
    { id: 'tickets', label: 'تیکت‌ها', icon: ChatBubbleLeftRightIcon, roles: ['OWNER', 'MANAGER', 'OPERATOR'] },
    { id: 'hero-models', label: 'اسلاید هیرو', icon: PhotoIcon, roles: ['OWNER', 'MANAGER'] },
    { id: 'profile', label: 'پروفایل', icon: UserCircleIcon, roles: ['OWNER', 'MANAGER', 'SELLER', 'MARKETER', 'OPERATOR'] },
  ];

  const onLogout = () => {
    // Set loading state
    setLoadingSection('logout');
    
    // Use a single promise chain for logout
    handleLogout()
      .then(() => {
        // Use Next.js router for smoother navigation
        router.replace('/admin/login');
      })
      .catch((error) => {
        console.error('Logout failed:', error);
        setLoadingSection(null);
      });
  };
  
  // Handle tab change with loading state
  const handleTabChange = async (tabId: string) => {
    setLoadingSection(tabId);
    setActiveTab(tabId);
    // Simulate loading state for a smoother experience
    await new Promise(resolve => setTimeout(resolve, 300));
    setLoadingSection(null);
  };

  return (
    <motion.nav
      initial={{ x: '100%', rotateY: 90 }}
      animate={{ x: 0, rotateY: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      style={{
        width: isCollapsed ? '3.5rem' : '16rem',
        transition: 'width 100ms ease-out, padding 100ms ease-out'
      }}
      className={`
        hidden md:flex flex-col h-screen
        bg-surface shadow-lg fixed right-0 top-0 z-50
        border-s border-border overflow-hidden
        ${isCollapsed ? 'p-3' : 'p-6'}
      `}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`mb-8 border-b border-border pb-6 flex items-center justify-between ${isCollapsed ? 'px-0' : 'px-2'}`}
      >
        <AnimatePresence>
          {!isCollapsed && (
            <motion.h1
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="text-2xl font-bold text-primary"
            >
              پنل مدیریت
            </motion.h1>
          )}
        </AnimatePresence>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg bg-primary-dim hover:bg-primary/20 transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Suspense fallback={<IconLoading />}>
            {isCollapsed ? (
              <EllipsisHorizontalIcon className="w-5 h-5 text-purple-400" />
            ) : (
              <EllipsisVerticalIcon className="w-5 h-5 text-purple-400" />
            )}
          </Suspense>
        </motion.button>
      </motion.div>

      {/* Menu Items */}
      <div className="flex-1 space-y-2 overflow-y-auto">
        {menus.map((item) => {
          // Check role-based visibility
          if (!item.roles.includes(adminRole || 'OWNER')) return null;
          
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          const isLoading = loadingSection === item.id;
          const isHovered = hoveredItem === item.id;
          
          return (
            <motion.button
              key={item.id}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              whileHover={{ 
                scale: 1.02,
                y: -2,
                transition: { type: 'spring', stiffness: 400 }
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleTabChange(item.id)}
              className={`
                w-full flex items-center gap-3 p-3 rounded-lg relative overflow-hidden
                transition-all duration-200 ease-out
                ${isCollapsed ? 'justify-center' : 'text-right'}
                ${isActive
                  ? 'bg-primary text-primary-fg'
                  : 'text-muted hover:bg-surface-2 hover:text-fg'}
                ${isLoading ? 'animate-pulse' : ''}
              `}
            >
              {/* Icon with animations */}
              <motion.div
                initial={{ scale: 1 }}
                animate={{
                  scale: isActive ? 1.1 : 1
                }}
                whileHover={{ 
                  scale: 1.2
                }}
                className={`flex items-center justify-center relative ${isActive ? 'text-primary-fg' : 'text-primary'}`}
              >
                <Suspense fallback={<IconLoading />}>
                  <IconComponent className={`w-6 h-6 transition-all duration-300`} />
                </Suspense>
                
                {/* Loading animation */}
                {isLoading && (
                  <motion.div
                    className="absolute inset-0 bg-purple-400/20 rounded-full"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </motion.div>
              
              {/* Label with animations */}
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="text-sm font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Active item background effect - removed blur */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="absolute inset-0 rounded-lg"
                  />
                )}
              </AnimatePresence>
              
              {/* Hover effect */}
              <AnimatePresence>
                {isHovered && !isActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 bg-purple-500/5 rounded-lg"
                  />
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Logout Button */}
      <motion.button
        whileHover={{ 
          scale: 1.02,
          y: -2,
          transition: { type: 'spring', stiffness: 400 }
        }}
        whileTap={{ scale: 0.98 }}
        onClick={onLogout}
        className={`
          mt-auto flex items-center gap-3 p-3 rounded-lg
          transition-all duration-200
          bg-error/10 hover:bg-error/20
          text-error hover:text-error/80
          ${isCollapsed ? 'justify-center' : ''}
          ${loadingSection === 'logout' ? 'animate-pulse' : ''}
        `}
      >
        <motion.div
          whileHover={{ 
            scale: 1.1
          }}
          className="relative"
        >
          <Suspense fallback={<IconLoading />}>
            <ArrowLeftOnRectangleIcon className="w-6 h-6" />
          </Suspense>
          
          {loadingSection === 'logout' && (
            <motion.div
              className="absolute inset-0 bg-red-400/20 rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </motion.div>

        <AnimatePresence>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="text-sm font-medium whitespace-nowrap"
            >
              خروج از حساب
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.nav>
  );
}