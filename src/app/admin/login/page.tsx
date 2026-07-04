'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FaKey, FaSignInAlt, FaPhone, FaLock, FaArrowLeft, FaCheck } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

// Admin login page component
export default function AdminLoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();

  // Check if user is already authenticated
  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/auth/me', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });
      const data = await response.json();
      if (data.success) {
        console.log('User is already authenticated, redirecting to /admin/panel');
        router.push('/admin/panel');
        router.refresh(); // Ensure server-side state is updated
      }
    } catch (err) {
      console.error('Error checking auth status:', err);
    }
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError('');
      setLoading(true);

      try {
        const response = await fetch('/api/admin/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phoneNumber, password }),
          credentials: 'include',
        });

        if (response.ok) {
          console.log('Login successful, redirecting to /admin/panel');
          await router.push('/admin/panel');
          router.refresh(); // Ensure server-side state is updated
        } else {
          const data = await response.json();
          setError(
            data.error || 'شماره تلفن یا رمز عبور نادرست است. لطفاً دوباره تلاش کنید.'
          );
        }
      } catch (err) {
        console.error('Login error:', err);
        setError('خطایی در ارتباط با سرور رخ داد. لطفاً بعداً تلاش کنید.');
      } finally {
        setLoading(false);
      }
    },
    [phoneNumber, password, router]
  );

  // Handle sending OTP for password recovery
  const handleSendOtp = useCallback(async () => {
    if (!phoneNumber) {
      setError('لطفاً شماره موبایل خود را وارد کنید');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const response = await fetch('/api/admin/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setOtpSent(true);
        setSuccess('کد تایید به شماره موبایل شما ارسال شد');
      } else {
        setError(data.error || 'خطایی در ارسال کد تایید رخ داد');
      }
    } catch (err) {
      console.error('OTP error:', err);
      setError('خطایی در ارتباط با سرور رخ داد. لطفاً بعداً تلاش کنید.');
    } finally {
      setLoading(false);
    }
  }, [phoneNumber]);
  
  // Handle verifying OTP and resetting password
  const handleResetPassword = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    if (!otp) {
      setError('لطفاً کد تایید را وارد کنید');
      return;
    }
    
    if (!newPassword) {
      setError('لطفاً رمز عبور جدید را وارد کنید');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('رمز عبور و تکرار آن مطابقت ندارند');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('رمز عبور باید حداقل ۸ کاراکتر باشد');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/admin/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber, otp, newPassword }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess('رمز عبور با موفقیت تغییر یافت');
        // Reset form and go back to login
        setTimeout(() => {
          setShowForgotPassword(false);
          setOtpSent(false);
          setOtp('');
          setNewPassword('');
          setConfirmPassword('');
          setSuccess('');
        }, 2000);
      } else {
        setError(data.error || 'خطایی در بازیابی رمز عبور رخ داد');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError('خطایی در ارتباط با سرور رخ داد. لطفاً بعداً تلاش کنید.');
    } finally {
      setLoading(false);
    }
  }, [phoneNumber, otp, newPassword, confirmPassword]);

  // Animation variants for form
  const formVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-4"
      dir="rtl"
    >
      {!showForgotPassword ? (
        <motion.form
          onSubmit={handleSubmit}
          variants={formVariants}
          initial="hidden"
          animate="visible"
          className="bg-[#1E293B]/90 p-8 rounded-xl shadow-lg w-full max-w-sm sm:max-w-md"
        >
          {/* Logo and branding */}
          <div className="flex flex-col items-center mb-10 space-y-4">
            <Link href="/" className="flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-2"
              >
                <Image
                  src="/bluelogo.png"
                  alt="Cavian Logo"
                  width={100}
                  height={100}
                  className="filter drop-shadow-md"
                  priority
                />
              </motion.div>
              <span className="text-3xl font-bold text-[#7C3AED] font-heading tracking-tight">
                کاویان
              </span>
            </Link>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-[#94A3B8] text-center font-body text-sm italic"
            >
              تن‌پوش‌های راوی، داستان شما
            </motion.p>
          </div>

          {/* Phone number input */}
          <div className="mb-6">
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-[#94A3B8] mb-2 font-body"
            >
              <FaPhone className="inline-block ml-2" />
              شماره موبایل:
            </label>
            <input
              type="text"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              autoComplete="tel"
              className="w-full px-4 py-2 bg-[#1E293B] border border-[#334155] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] text-[#E2E8F0] placeholder-[#64748B]/80 text-right font-body text-base transition-colors duration-300"
              placeholder="شماره همراه خود را وارد کنید"
              dir="rtl"
              required
              aria-label="شماره تلفن"
            />
          </div>

          {/* Password input */}
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#94A3B8] mb-2 font-body"
            >
              <FaKey className="inline-block ml-2" />
              رمز عبور:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full px-4 py-2 bg-[#1E293B] border border-[#334155] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] text-[#E2E8F0] placeholder-[#64748B]/80 text-right font-body text-base transition-colors duration-300"
              placeholder="لطفا رمز عبور خود را وارد کنید"
              dir="rtl"
              required
              aria-label="رمز عبور"
            />
          </div>

          {/* Submit button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-heading font-bold py-2.5 px-6 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg focus:ring-2 focus:ring-[#7C3AED] focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <span className="flex items-center">
                <FaSignInAlt className="mr-2" />
                در حال ورود...
              </span>
            ) : (
              <span className="flex items-center">
                <FaSignInAlt className="mr-2" />
                ورود به پنل مدیریت
              </span>
            )}
          </motion.button>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="mt-6 text-center text-sm text-[#EF4444] font-body bg-[#EF4444]/10 p-3 rounded-lg"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Forgot Password Link */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-[#7C3AED] hover:text-[#6D28D9] text-sm font-body transition-colors duration-300"
            >
              رمز عبور خود را فراموش کرده‌اید؟
            </button>
          </div>
        </motion.form>
      ) : (
        <motion.div
          variants={formVariants}
          initial="hidden"
          animate="visible"
          className="bg-[#1E293B]/90 p-8 rounded-xl shadow-lg w-full max-w-sm sm:max-w-md"
        >
          {/* Back button */}
          <button
            type="button"
            onClick={() => {
              setShowForgotPassword(false);
              setOtpSent(false);
              setOtp('');
              setNewPassword('');
              setConfirmPassword('');
              setError('');
              setSuccess('');
            }}
            className="mb-6 text-[#94A3B8] hover:text-white flex items-center text-sm font-body transition-colors duration-300"
          >
            <FaArrowLeft className="ml-2" />
            بازگشت به صفحه ورود
          </button>

          {/* Logo and branding */}
          <div className="flex flex-col items-center mb-8 space-y-4">
            <Link href="/" className="flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-2"
              >
                <Image
                  src="/bluelogo.png"
                  alt="Cavian Logo"
                  width={80}
                  height={80}
                  className="filter drop-shadow-md"
                  priority
                />
              </motion.div>
            </Link>
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl font-bold text-white font-heading"
            >
              بازیابی رمز عبور
            </motion.h2>
          </div>

          {!otpSent ? (
            <div>
              {/* Phone number input for OTP */}
              <div className="mb-6">
                <label
                  htmlFor="forgotPhoneNumber"
                  className="block text-sm font-medium text-[#94A3B8] mb-2 font-body"
                >
                  <FaPhone className="inline-block ml-2" />
                  شماره موبایل:
                </label>
                <input
                  type="text"
                  id="forgotPhoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  autoComplete="tel"
                  className="w-full px-4 py-2 bg-[#1E293B] border border-[#334155] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] text-[#E2E8F0] placeholder-[#64748B]/80 text-right font-body text-base transition-colors duration-300"
                  placeholder="شماره همراه خود را وارد کنید"
                  dir="rtl"
                  required
                  aria-label="شماره تلفن"
                />
              </div>

              {/* Send OTP button */}
              <motion.button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-heading font-bold py-2.5 px-6 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg focus:ring-2 focus:ring-[#7C3AED] focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <span className="flex items-center">
                    در حال ارسال کد...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <FaKey className="ml-2" />
                    ارسال کد تایید
                  </span>
                )}
              </motion.button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword}>
              {/* OTP input */}
              <div className="mb-6">
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-[#94A3B8] mb-2 font-body"
                >
                  <FaKey className="inline-block ml-2" />
                  کد تایید:
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-2 bg-[#1E293B] border border-[#334155] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] text-[#E2E8F0] placeholder-[#64748B]/80 text-right font-body text-base transition-colors duration-300"
                  placeholder="کد ارسال شده به موبایل خود را وارد کنید"
                  dir="rtl"
                  required
                  aria-label="کد تایید"
                />
              </div>

              {/* New password input */}
              <div className="mb-6">
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-[#94A3B8] mb-2 font-body"
                >
                  <FaLock className="inline-block ml-2" />
                  رمز عبور جدید:
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-[#1E293B] border border-[#334155] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] text-[#E2E8F0] placeholder-[#64748B]/80 text-right font-body text-base transition-colors duration-300"
                  placeholder="رمز عبور جدید را وارد کنید"
                  dir="rtl"
                  required
                  aria-label="رمز عبور جدید"
                />
              </div>

              {/* Confirm password input */}
              <div className="mb-6">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-[#94A3B8] mb-2 font-body"
                >
                  <FaLock className="inline-block ml-2" />
                  تکرار رمز عبور جدید:
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-[#1E293B] border border-[#334155] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] text-[#E2E8F0] placeholder-[#64748B]/80 text-right font-body text-base transition-colors duration-300"
                  placeholder="رمز عبور جدید را مجدداً وارد کنید"
                  dir="rtl"
                  required
                  aria-label="تکرار رمز عبور جدید"
                />
              </div>

              {/* Reset password button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-heading font-bold py-2.5 px-6 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg focus:ring-2 focus:ring-[#7C3AED] focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <span className="flex items-center">
                    در حال بازیابی رمز عبور...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <FaKey className="ml-2" />
                    بازیابی رمز عبور
                  </span>
                )}
              </motion.button>

              {/* Resend OTP button */}
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="text-[#7C3AED] hover:text-[#6D28D9] text-sm font-body transition-colors duration-300"
                >
                  ارسال مجدد کد تایید
                </button>
              </div>
            </form>
          )}

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="mt-6 text-center text-sm text-[#EF4444] font-body bg-[#EF4444]/10 p-3 rounded-lg"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success message */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="mt-6 text-center text-sm text-green-500 font-body bg-green-500/10 p-3 rounded-lg flex items-center justify-center"
              >
                <FaCheck className="ml-2" />
                {success}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}