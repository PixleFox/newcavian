'use client';
import { FC, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  EyeIcon, 
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  DevicePhoneMobileIcon,
  UserCircleIcon,
  EnvelopeIcon,
  KeyIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  FingerPrintIcon
} from '@heroicons/react/24/solid';
import { Admin } from './AdminManagement';

// Input field component with consistent styling and behavior
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  icon?: React.ReactNode;
  hint?: string;
  error?: string;
  required?: boolean;
  showValidIcon?: boolean;
}

const InputField: FC<InputFieldProps> = ({ label, id, icon, hint, error, required, showValidIcon = true, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  const { value = '' } = props;

  // Custom validation logic for different fields
  const isValidValue = () => {
    // Never show valid icon if there's an error or field is empty or focused
    if (!value || isFocused || error) return false;
    
    switch (id) {
      case 'email':
        return typeof value === 'string' && value.includes('@') && value.includes('.');
      case 'phoneNumber':
        const digits = typeof value === 'string' ? value.replace(/[^\d]/g, '') : '';
        return digits.length >= 10;
      case 'password':
        return typeof value === 'string' && value.length >= 8;
      default:
        return typeof value === 'string' && value.toString().trim().length > 0;
    }
  };

  return (
    <div className="space-y-3">
      <label 
        htmlFor={id} 
        className={`block text-sm font-medium transition-colors duration-200 ${error ? 'text-red-400' : isFocused ? 'text-purple-500' : 'text-purple-300'} font-body`}
      >
        {label}
        {required && <span className="text-red-400 mr-1">*</span>}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#94A3B8]">
          {icon}
        </div>
        <input
          {...props}
          id={id}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full py-3 px-10 bg-[#1E293B] border rounded-lg text-[#E2E8F0] 
            placeholder-purple-400/50 focus:outline-none focus:ring-2 transition-all duration-200
            ${error ? 'border-red-500 focus:ring-red-500' : 'border-purple-700/50 focus:ring-purple-500'}
            font-body ${id === 'email' ? 'text-left' : 'text-right'}
          `}
          required={required}
          aria-label={label}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          dir={id === 'email' || id === 'phoneNumber' ? 'ltr' : 'rtl'}
          {...(id === 'phoneNumber' && {
            type: 'tel',
            pattern: '^(\\+98|0)?9\\d{9}$',
            maxLength: 11
          })}
          {...(id === 'email' && {
            type: 'email',
            pattern: '[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,6}$'
          })}
          {...(id === 'password' && {
            type: 'password',
            minLength: 8,
            maxLength: 50
          })}
          {...((id === 'firstName' || id === 'lastName') && {
            type: 'text',
            pattern: '^[\\u0600-\\u06FF\\s]+$|^[a-zA-Z\\s]+$',
            minLength: 2,
            maxLength: 50
          })}
        />
        {/* Validation icons removed to prevent overlapping */}
      </div>
      {error && <p id={`${id}-error`} className="text-xs text-red-500 mt-1" role="alert">{error}</p>}
    </div>
  );
};

// Password strength checker with detailed feedback
interface PasswordStrengthResult {
  score: number; // 0-4
  feedback: string;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumbers: boolean;
  hasSpecialChar: boolean;
  isLongEnough: boolean;
}

const checkPasswordStrength = (password: string): PasswordStrengthResult => {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isLongEnough = password.length >= 8;
  
  let score = 0;
  if (hasUpperCase) score++;
  if (hasLowerCase) score++;
  if (hasNumbers) score++;
  if (hasSpecialChar) score++;
  if (isLongEnough) score = Math.min(score + 1, 4);
  
  let feedback = '';
  switch (score) {
    case 0:
      feedback = 'رمز عبور بسیار ضعیف است';
      break;
    case 1:
      feedback = 'رمز عبور ضعیف است';
      break;
    case 2:
      feedback = 'رمز عبور متوسط است';
      break;
    case 3:
      feedback = 'رمز عبور خوب است';
      break;
    case 4:
      feedback = 'رمز عبور قوی است';
      break;
  }
  
  return {
    score,
    feedback,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar,
    isLongEnough
  };
};

interface AdminCreateFormProps {
  newAdmin: {
    phoneNumber: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: Admin['role'];
  };
  setNewAdmin: React.Dispatch<
    React.SetStateAction<{
      phoneNumber: string;
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      role: Admin['role'];
    }>
  >;
  handleCreateAdmin: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  roleOptions: { value: Admin['role']; label: string }[];
}

const AdminCreateForm = ({
  newAdmin,
  setNewAdmin,
  handleCreateAdmin,
  isLoading,
  roleOptions,
}: AdminCreateFormProps) => {

  const [showPassword, setShowPassword] = useState(false);
  const [passwordDetails, setPasswordDetails] = useState<PasswordStrengthResult>({
    score: 0,
    feedback: '',
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumbers: false,
    hasSpecialChar: false,
    isLongEnough: false
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formTouched, setFormTouched] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (newAdmin.password) {
      setPasswordDetails(checkPasswordStrength(newAdmin.password));
    }
    
    // Set form to untouched state when component mounts
    setFormTouched(false);
    setValidationErrors({});
  }, []);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Phone number validation - Iranian format
    const phoneNumberDigits = newAdmin.phoneNumber.replace(/[^\d]/g, '');
    if (!phoneNumberDigits) {
      errors.phoneNumber = 'شماره تلفن الزامی است';
    } else {
      // Convert to standard format (remove +98 or 0 prefix)
      let normalizedNumber = phoneNumberDigits;
      if (normalizedNumber.startsWith('98')) {
        normalizedNumber = normalizedNumber.substring(2);
      }
      if (normalizedNumber.startsWith('0')) {
        normalizedNumber = normalizedNumber.substring(1);
      }
      
      // Check for Iranian mobile number format
      const isValidIranianMobile = /^9\d{9}$/.test(normalizedNumber);
      if (!isValidIranianMobile) {
        errors.phoneNumber = 'شماره موبایل باید به فرمت 09XXXXXXXXX یا +989XXXXXXXXX باشد';
      }
    }

    // First name validation - Persian/English letters only
    if (!newAdmin.firstName.trim()) {
      errors.firstName = 'نام الزامی است';
    } else if (!/^[\u0600-\u06FF\s]+$|^[a-zA-Z\s]+$/.test(newAdmin.firstName.trim())) {
      errors.firstName = 'نام باید فقط شامل حروف فارسی یا انگلیسی باشد';
    }

    // Last name validation - Persian/English letters only
    if (!newAdmin.lastName.trim()) {
      errors.lastName = 'نام خانوادگی الزامی است';
    } else if (!/^[\u0600-\u06FF\s]+$|^[a-zA-Z\s]+$/.test(newAdmin.lastName.trim())) {
      errors.lastName = 'نام خانوادگی باید فقط شامل حروف فارسی یا انگلیسی باشد';
    }

    // Email validation (optional but must be valid if provided)
    if (newAdmin.email) {
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      if (!emailRegex.test(newAdmin.email.trim())) {
        errors.email = 'لطفاً یک ایمیل معتبر وارد کنید';
      }
    }

    // Password validation - more comprehensive
    if (!newAdmin.password) {
      errors.password = 'رمز عبور الزامی است';
    } else {
      const passwordStrength = checkPasswordStrength(newAdmin.password);
      if (passwordStrength.score < 3) {
        errors.password = 'رمز عبور باید شامل حداقل 8 کاراکتر، حروف بزرگ و کوچک، اعداد و علائم خاص باشد';
      }
    }

    // Role validation
    if (!newAdmin.role) {
      errors.role = 'انتخاب نقش الزامی است';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent any browser validation
    setFormTouched(true);

    // Validate form
    const isValid = validateForm();
    if (!isValid) {
      if (formRef.current) {
        const firstError = formRef.current.querySelector('.error-field');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }

    // If valid, proceed with form submission
    await handleCreateAdmin(e);
  };

  // Handle input changes and validate on the fly
  const handleInputChange = (field: keyof typeof newAdmin, value: string) => {
    setNewAdmin((prev: typeof newAdmin) => ({ ...prev, [field]: value }));
    if (formTouched) {
      validateForm();
    }
  };

  return (
    <motion.form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 bg-[#1E293B]/50 p-6 rounded-xl border border-[#334155] backdrop-blur-sm"
    >
      {Object.keys(validationErrors).length > 0 && (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-2 mb-3">
          <ul className="list-disc list-inside text-red-500 text-xs">
            {Object.values(validationErrors).map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <InputField
            id="phoneNumber"
            label="شماره تلفن"
            type="tel"
            placeholder="09123456789"
            icon={<DevicePhoneMobileIcon className="h-4 w-4" />}
            value={newAdmin.phoneNumber}
            onChange={(e) => {
              let value = e.target.value.replace(/[^\d]/g, '');
              if (value.length > 11) value = value.slice(0, 11);
              handleInputChange('phoneNumber', value);
            }}
            error={validationErrors.phoneNumber}
            required
            maxLength={11}
            hint="مثال: 09123456789"
          />
        </div>
        <div>
          <InputField
            id="firstName"
            label="نام"
            type="text"
            placeholder="نام"
            icon={<UserCircleIcon className="h-4 w-4" />}
            value={newAdmin.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            error={validationErrors.firstName}
            required
            autoFocus
          />
        </div>
        <div>
          <InputField
            id="lastName"
            label="نام خانوادگی"
            type="text"
            placeholder="نام خانوادگی"
            icon={<UserCircleIcon className="h-4 w-4" />}
            value={newAdmin.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            error={validationErrors.lastName}
            required
          />
        </div>
        <div>
          <InputField
            id="email"
            label="ایمیل (اختیاری)"
            placeholder="example@cavian.ir"
            icon={<EnvelopeIcon className="h-4 w-4" />}
            value={newAdmin.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={validationErrors.email}
            hint="ایمیل معتبر وارد کنید"
            type="text" // Changed from email to text to avoid browser validation
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-xs font-medium text-purple-300 mb-1 font-body">
            رمز عبور
            <span className="text-red-400 mr-1">*</span>
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={newAdmin.password}
              onChange={(e) => {
                handleInputChange('password', e.target.value);
                setPasswordDetails(checkPasswordStrength(e.target.value));
              }}
              placeholder="رمز عبور"
              className="w-full p-3 bg-[#1E293B] border border-purple-700/50 rounded-lg text-[#E2E8F0] placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500 font-body text-right pr-12 transition-all duration-200"
              required
              onInvalid={(e) => e.preventDefault()}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-300 transition-colors"
            >
              {showPassword ? <EyeSlashIcon className="h-6 w-6" /> : <EyeIcon className="h-6 w-6" />}
            </button>
          </div>
          {/* Password Strength Indicator */}
          <div className="h-1 w-full bg-gray-700 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                passwordDetails.score === 0 ? 'bg-red-500 w-[20%]' :
                passwordDetails.score === 1 ? 'bg-yellow-500 w-[40%]' :
                passwordDetails.score === 2 ? 'bg-blue-500 w-[60%]' :
                passwordDetails.score === 3 ? 'bg-green-400 w-[80%]' :
                'bg-green-500 w-full'
              }`}
            />
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">{passwordDetails.feedback}</p>
          {validationErrors.password && <p id="password-error" className="text-xs text-red-500 mt-1" role="alert">{validationErrors.password}</p>}
        </div>
        <div>
          <label htmlFor="role" className="block text-xs font-medium text-[#94A3B8] mb-1 font-body">
            نقش
            <span className="text-red-400 mr-1">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#94A3B8]">
              <UserGroupIcon className="h-4 w-4" />
            </div>
            <select
              id="role"
              value={newAdmin.role}
              onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value as Admin['role'] })}
              className={`w-full py-2 px-9 bg-[#1E293B] border rounded-lg text-[#E2E8F0] focus:outline-none focus:ring-1 
                ${validationErrors.role ? 'border-red-500 focus:ring-red-500' : 'border-[#334155] focus:ring-[#7C3AED]'}
                font-body appearance-none text-right`}
              title="نقش ادمین را انتخاب کنید"
              required
              aria-label="نقش"
              aria-invalid={!!validationErrors.role}
              aria-describedby={validationErrors.role ? 'role-error' : undefined}
            >
              <option value="" disabled>انتخاب نقش</option>
              {roleOptions.map((option: { value: Admin['role']; label: string }) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-purple-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {validationErrors.role && <p id="role-error" className="text-xs text-red-500 mt-1" role="alert">{validationErrors.role}</p>}
        </div>
      </div>
      
      <AnimatePresence>
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-green-500/20 border border-green-500 rounded-lg p-4 mb-4 flex items-center"
          >
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-green-500">{successMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: isLoading ? 1 : 1.05 }}
          whileTap={{ scale: isLoading ? 1 : 0.95 }}
          className={`
            w-full py-2 px-3 rounded-lg text-white font-semibold font-heading 
            transition-all duration-300 flex items-center justify-center 
            ${isLoading ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 shadow-md hover:shadow-lg shadow-purple-500/20'}
            focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#1E293B]
          `}
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <FingerPrintIcon className="h-5 w-5 mr-2 text-white animate-pulse" />
          )}
          {isLoading ? 'در حال ایجاد...' : 'ایجاد ادمین جدید'}
        </motion.button>
    </motion.form>
  );
};

export default AdminCreateForm;