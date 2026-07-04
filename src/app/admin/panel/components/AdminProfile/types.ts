// Define the data structure for the admin profile
export interface AdminProfileData {
  id: number;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  email: string | null;
  role: 'OWNER' | 'MANAGER' | 'SELLER' | 'MARKETER' | 'OPERATOR';
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  avatar?: string;
  notifications?: NotificationSettings;
  securitySettings?: SecuritySettings;
  activityLog?: ActivityLogEntry[];
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  orderUpdates: boolean;
  securityAlerts: boolean;
  marketingUpdates: boolean;
  systemUpdates: boolean;
}

export interface SecuritySettings {
  lastPasswordChange: string;
  sessionTimeout: number; // in minutes
  loginNotifications: boolean;
  allowedIPs?: string[];
}

export interface ActivityLogEntry {
  id: number;
  action: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  details?: string;
}

// Define the data structure for profile update requests
export interface ProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: File | null;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface NotificationUpdateRequest {
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  orderUpdates?: boolean;
  securityAlerts?: boolean;
  marketingUpdates?: boolean;
  systemUpdates?: boolean;
}
