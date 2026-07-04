'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import NuclearSidebar from './components/Sidebar';
import AdminManagement from './components/Admin Management/AdminManagement';
import Dashboard from './components/Dashboard';
import Products from './components/Products/Products';
import Discounts from './components/Discounts';
import Collections from './components/Collections';
import Users from './components/Users';
import Tickets from './components/Tickets';
import OrdersTable from './components/OrdersTable';
import { BarLoader } from 'react-spinners';
import { AdminProfile } from './components/AdminProfile';
import HeroSlidesManager from './components/HeroSlidesManager';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  // Check authentication status
  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/auth/me', {
        cache: 'no-store',
        credentials: 'include', // Ensure cookies are sent
      });
      const data = await res.json();
      if (data.success) {
        setIsLoggedIn(true);
      } else {
        console.log('Not authenticated, redirecting to /admin/login');
        router.push('/admin/login');
      }
    } catch (err) {
      console.error('Error checking auth:', err);
      router.push('/admin/login');
    }
  }, [router]);

  // Handle window resize for mobile detection
  const handleResize = useCallback(() => {
    setIsMobile(window.innerWidth <= 768);
  }, []);

  useEffect(() => {
    checkAuth();

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [checkAuth, handleResize]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setIsLoggedIn(false);
      router.push('/admin/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Loading state
  if (isLoggedIn === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg text-fg">
        <BarLoader color="var(--primary)" width={200} height={4} />
      </div>
    );
  }

  // Mobile warning
  if (isMobile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg text-fg">
        <div className="card p-6 text-center max-w-sm mx-4">
          <h2 className="text-xl font-bold text-primary mb-4">توجه</h2>
          <p className="text-muted">این پنل مخصوص دسکتاپ توسعه داده شده است و در موبایل کاربرد ندارد.</p>
        </div>
      </div>
    );
  }

  // Desktop view: Render the admin panel
  return (
    <div className="flex min-h-screen bg-bg text-fg" dir="rtl">
      {/* Desktop Sidebar */}
      <NuclearSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="flex-1 p-6 transition-all duration-300 mr-64">
        <div className="flex justify-between items-center mb-6"></div>

        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'admins' && <AdminManagement />}
        {activeTab === 'products' && <Products />}
        {activeTab === 'collections' && <Collections />}
        {activeTab === 'discounts' && <Discounts />}
        {activeTab === 'users' && <Users />}
        {activeTab === 'tickets' && <Tickets />}
        {activeTab === 'hero-models' && <HeroSlidesManager />}
        {activeTab === 'profile' && <AdminProfile />}
        {activeTab === 'orders' && <OrdersTable />}
      </main>
    </div>
  );
}