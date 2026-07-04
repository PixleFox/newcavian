'use client';
import { useState, useRef, useMemo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  UserCircleIcon, 
  PencilIcon,
  CameraIcon
} from '@heroicons/react/24/outline';
import { AdminProfileData } from './types';

interface ProfileHeaderProps {
  profileData: AdminProfileData;
  onUpdate: (data: Partial<AdminProfileData>) => Promise<void>;
}

export default function ProfileHeader({ profileData, onUpdate }: ProfileHeaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get role label in Persian
  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      'OWNER': 'مالک',
      'MANAGER': 'مدیر',
      'SELLER': 'فروشنده',
      'MARKETER': 'بازاریاب',
      'OPERATOR': 'اپراتور'
    };
    return roleMap[role] || role;
  };
  
  // Get role color class
  const getRoleColorClass = (role: string) => {
    const colorMap: Record<string, string> = {
      'OWNER': 'bg-gradient-to-r from-amber-500 to-yellow-500 text-yellow-900',
      'MANAGER': 'bg-gradient-to-r from-purple-500 to-indigo-500 text-indigo-900',
      'SELLER': 'bg-gradient-to-r from-blue-500 to-cyan-500 text-cyan-900',
      'MARKETER': 'bg-gradient-to-r from-green-500 to-emerald-500 text-emerald-900',
      'OPERATOR': 'bg-gradient-to-r from-gray-500 to-slate-500 text-slate-900'
    };
    return colorMap[role] || 'bg-gray-500 text-white';
  };

  
  // Generate avatar color based on admin ID
  const avatarColor = useMemo(() => {
    const colors = [
      '#5D4037', '#455A64', '#616161', '#607D8B', '#546E7A', '#37474F', 
      '#7B1FA2', '#512DA8', '#303F9F', '#1976D2', '#0288D1', '#0097A7', 
      '#00796B', '#388E3C', '#689F38', '#AFB42B', '#FBC02D', '#FFA000'
    ];
    // Generate a consistent color based on the admin's ID
    const colorIndex = profileData.id % colors.length;
    return colors[colorIndex];
  }, [profileData.id]);
  
  // Get initials for avatar
  const initials = useMemo(() => {
    return `${profileData.firstName.charAt(0)}${profileData.lastName.charAt(0)}`;
  }, [profileData.firstName, profileData.lastName]);
  
  // Format phone number to local format (09XXXXXXXXX)
  const formatPhoneNumber = (phone: string): string => {
    // Remove any non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Check if it starts with +98
    if (phone.startsWith('+98')) {
      return '0' + phone.substring(3);
    }
    
    // Check if it's a 10-digit number starting with 9
    if (digits.length === 10 && digits.startsWith('9')) {
      return '0' + digits;
    }
    
    // If it already starts with 0, return as is
    if (digits.startsWith('0')) {
      return digits;
    }
    
    // Default case
    return phone;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-gradient-to-br from-purple-900/40 to-indigo-900/40 rounded-2xl p-6 border border-purple-500/30 shadow-xl shadow-purple-900/10"
    >
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Avatar Section */}
        <div className="relative group">
          <div 
            className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500/30 shadow-lg shadow-purple-500/20 flex items-center justify-center"
            style={{ backgroundColor: avatarColor }}
          >
            <span className="text-white text-4xl font-bold">
              {initials}
            </span>
          </div>
          
          {/* Info overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center cursor-pointer"
          >
            <div className="text-white text-xs text-center p-2">
              <p>{profileData.firstName.charAt(0)}{profileData.lastName.charAt(0)}</p>
              <p className="text-purple-300 mt-1">نام و نام خانوادگی</p>
            </div>
          </motion.div>
        </div>
        
        {/* Profile Info */}
        <div className="flex-1 text-center md:text-right">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-indigo-300">
            {profileData.firstName} {profileData.lastName}
          </h1>
          
          <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRoleColorClass(profileData.role)}`}>
              {getRoleLabel(profileData.role)}
            </span>
            
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-900/50 text-purple-300 border border-purple-500/30">
              {profileData.isActive ? 'فعال' : 'غیرفعال'}
            </span>
          </div>
          
          
        </div>
        
        {/* Stats Cards */}
        <div className="flex flex-wrap gap-4 justify-center md:justify-end">
          <motion.div 
            whileHover={{ y: -5, scale: 1.03 }}
            className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-4 w-40 text-center"
          >
            <p className="text-purple-300 text-xs">تاریخ عضویت</p>
            <p className="text-white font-bold mt-1 text-sm">
              {new Date(profileData.createdAt).toLocaleDateString('fa-IR')}
            </p>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5, scale: 1.03 }}
            className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-4 w-40 text-center"
          >
            <p className="text-purple-300 text-xs">آخرین ورود</p>
            <p className="text-white font-bold mt-1 text-sm">
              {profileData.lastLogin 
                ? new Date(profileData.lastLogin).toLocaleDateString('fa-IR')
                : 'ثبت نشده'}
            </p>
          </motion.div>
        </div>
      </div>
      
      {/* Contact Info */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-purple-900/20 border border-purple-500/20 rounded-lg p-4">
          <p className="text-purple-300 text-xs">شماره موبایل</p>
          <p className="text-white font-bold mt-1 text-sm dir-ltr text-center">
            {formatPhoneNumber(profileData.phoneNumber)}
          </p>
        </div>
        
        <div className="bg-purple-900/20 border border-purple-500/20 rounded-lg p-4">
          <p className="text-purple-300 text-xs">ایمیل</p>
          <p className="text-white font-bold mt-1 text-sm dir-ltr text-center">
            {profileData.email || 'ثبت نشده'}
          </p>
        </div>
        
        <div className="bg-purple-900/20 border border-purple-500/20 rounded-lg p-4">
          <p className="text-purple-300 text-xs">شناسه کاربری</p>
          <p className="text-white font-bold mt-1 text-sm dir-ltr text-center">
            {profileData.id}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
