'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from './ThemeToggle';

const navItems = [
  { name: 'صفحه اصلی', href: '/' },
  { name: 'خدمات', href: '#services' },
  { name: 'درباره ما', href: '#about' },
  { name: 'تماس با ما', href: '#contact' },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header 
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-lg py-2' 
          : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 space-x-reverse"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div 
              className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              C
            </motion.div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Cavian
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 space-x-reverse">
            {navItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href}
                className={`relative px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === item.href 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'
                }`}
              >
                {item.name}
                {pathname === item.href && (
                  <motion.span 
                    layoutId="activeNavItem"
                    className="absolute bottom-0 right-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Right Side - Auth Buttons & Theme Toggle */}
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="hidden md:flex items-center space-x-4 space-x-reverse">
              <Link 
                href="/user/login" 
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                ورود
              </Link>
              <Link 
                href="/user/register" 
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:opacity-90 transition-opacity"
              >
                ثبت نام
              </Link>
            </div>
            
            <ThemeToggle />
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              onClick={toggleMobileMenu}
              aria-label={mobileMenuOpen ? 'بستن منو' : 'باز کردن منو'}
            >
              {mobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2 border-t border-gray-200 dark:border-gray-700">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    pathname === item.href
                      ? 'bg-blue-50 text-blue-700 dark:bg-gray-800 dark:text-blue-400'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href="/user/login"
                  className="block w-full text-center px-4 py-2 text-base font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-800 rounded-md mb-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  ورود به حساب کاربری
                </Link>
                <Link
                  href="/user/register"
                  className="block w-full text-center px-4 py-2 text-base font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-md hover:opacity-90 transition-opacity"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  ساخت حساب جدید
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
