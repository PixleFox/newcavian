'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import UserSidebar from './components/UserSidebar';
import UserDashboard from './components/UserDashboard';
import UserOrders from './components/UserOrders';
import UserProfile from './components/UserProfile';
import UserCoupons from './components/UserCoupons';
import UserWishlist from './components/UserWishlist';
import UserTicketsPage from './components/UserTicketsPage';
import UserMobileMenu from './components/UserMobileMenu';
import { BarLoader } from 'react-spinners';
import { toast } from 'react-hot-toast';

const TAB_LABELS: Record<string, string> = {
  dashboard: 'داشبورد',
  orders: 'سفارش‌ها',
  profile: 'پروفایل',
  coupons: 'کوپن‌ها',
  wishlist: 'لیست علاقه‌مندی‌ها',
  support: 'پشتیبانی',
};

export default function UserPanel() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/user/auth/me', { cache: 'no-store' });
        const data = await res.json();
        if (!data.authenticated) {
          router.push('/user/login');
        } else {
          setIsLoggedIn(true);
        }
      } catch {
        router.push('/user/login');
      }
    };
    checkAuth();
  }, [router]);

  if (isLoggedIn === null) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-bg">
        <BarLoader color="var(--primary)" width={200} height={4} />
      </div>
    );
  }

  const handleLogout = async () => {
    await fetch('/api/user/auth/logout', { method: 'POST' });
    setIsLoggedIn(false);
    toast.success('با موفقیت از حساب کاربری خارج شدید');
    router.push('/user/login');
  };

  return (
    <div className="flex min-h-dvh bg-bg text-fg" dir="rtl">
      <UserSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
      />

      <main className="flex-1 p-4 md:p-6 md:mr-64 pb-24 md:pb-6 max-w-3xl">
        <div className="mb-4 flex items-center gap-2">
          <div className="w-1 h-4 rounded-full" style={{ background: 'var(--primary)' }} />
          <h1 className="text-base font-bold text-fg">{TAB_LABELS[activeTab] ?? activeTab}</h1>
        </div>

        {activeTab === 'dashboard' && <UserDashboard />}
        {activeTab === 'orders' && <UserOrders />}
        {activeTab === 'profile' && <UserProfile />}
        {activeTab === 'coupons' && <UserCoupons />}
        {activeTab === 'wishlist' && <UserWishlist />}
        {activeTab === 'support' && <UserTicketsPage />}
      </main>

      <UserMobileMenu activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
