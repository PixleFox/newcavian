import Kavenegar from 'kavenegar';
import { logSecurityEvent, AuditEventType, AuditSeverity } from './audit-logger';

interface OTPRecord {
  otp: string;
  expires: number;
  attempts: number;
  lastRequest: number;
  requestCount: number;
}

const api = Kavenegar.KavenegarApi({
  apikey: process.env.KAVENEGAR_API_KEY!,
});

// Constants for rate limiting
const MAX_OTP_ATTEMPTS = 3; // Maximum verification attempts
const MAX_REQUESTS_PER_WINDOW = 3; // Maximum requests in time window
const REQUEST_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const BLOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

// Storage for OTP records and blocked numbers
const otpStorage = new Map<string, OTPRecord>();
const blockedNumbers = new Map<string, number>(); // phone -> block expiry time

/**
 * Generates a 6-digit OTP
 */
export const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

/**
 * Checks if a phone number is currently blocked
 */
const isBlocked = (phone: string): boolean => {
  const blockExpiry = blockedNumbers.get(phone);
  if (blockExpiry && blockExpiry > Date.now()) {
    return true;
  }
  blockedNumbers.delete(phone);
  return false;
};

/**
 * Blocks a phone number for the specified duration
 */
const blockNumber = async (phone: string) => {
  const blockExpiry = Date.now() + BLOCK_DURATION_MS;
  blockedNumbers.set(phone, blockExpiry);
  
  // Log the blocking event
  await logSecurityEvent(
    AuditEventType.RATE_LIMIT_EXCEEDED,
    null,
    {
      details: {
        phoneNumber: phone,
        blockExpiry: new Date(blockExpiry).toISOString(),
        reason: 'Too many OTP requests'
      }
    }
  );
};

/**
 * Sends OTP via Kavenegar with fallback mechanisms
 */
export const sendOtp = async (phone: string, otp: string) => {
  // Check if number is blocked
  if (isBlocked(phone)) {
    throw new Error('شماره شما به دلیل درخواست‌های مکرر مسدود شده است. لطفاً بعداً تلاش کنید');
  }

  // Check rate limiting
  const record = otpStorage.get(phone) || {
    otp: '',
    expires: 0,
    attempts: 0,
    lastRequest: 0,
    requestCount: 0
  };

  const now = Date.now();
  
  // Reset request count if window has passed
  if (now - record.lastRequest > REQUEST_WINDOW_MS) {
    record.requestCount = 0;
  }

  // Check request limit
  if (record.requestCount >= MAX_REQUESTS_PER_WINDOW) {
    await blockNumber(phone);
    throw new Error('تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً بعداً تلاش کنید');
  }

  try {
    // Try primary Kavenegar service
    await new Promise((resolve, reject) => {
      api.VerifyLookup({
        receptor: phone,
        token: otp,
        template: 'otp',
      }, (response: any, status: any) => {
        if (status === 200) resolve(response);
        else reject(new Error('Failed to send OTP'));
      });
    });

    // Update rate limiting data
    record.requestCount++;
    record.lastRequest = now;
    
  } catch (error) {
    // Log the failure
    const err = error as Error;
    await logSecurityEvent(
      AuditEventType.OTP_REQUEST,
      null,
      {
        details: {
          phoneNumber: phone,
          success: false,
          error: err.message
        }
      }
    );

    // Try fallback SMS service here if implemented
    // For now, throw a user-friendly error
    throw new Error('در حال حاضر امکان ارسال پیامک وجود ندارد. لطفاً چند دقیقه دیگر تلاش کنید');
  }

  // Log successful OTP send
  await logSecurityEvent(
    AuditEventType.OTP_REQUEST,
    null,
    {
      details: {
        phoneNumber: phone,
        success: true
      }
    }
  );
};

/**
 * Stores OTP with metadata
 */
export const storeOtp = (phone: string, otp: string) => {
  const record = otpStorage.get(phone) || {
    otp: '',
    expires: 0,
    attempts: 0,
    lastRequest: Date.now(),
    requestCount: 0
  };

  record.otp = otp;
  record.expires = Date.now() + OTP_EXPIRY_MS;
  record.attempts = 0;
  
  otpStorage.set(phone, record);
};

/**
 * Verifies OTP with attempt limiting
 */
export const verifyOtp = async (phone: string, otp: string) => {
  const record = otpStorage.get(phone);
  if (!record) return false;

  // Check expiration
  if (record.expires < Date.now()) {
    otpStorage.delete(phone);
    return false;
  }

  // Increment attempt counter
  record.attempts++;

  // Check max attempts
  if (record.attempts > MAX_OTP_ATTEMPTS) {
    await blockNumber(phone);
    otpStorage.delete(phone);
    throw new Error('تعداد تلاش‌های ناموفق بیش از حد مجاز است. لطفاً بعداً تلاش کنید');
  }

  const isValid = record.otp === otp;

  // Log verification attempt
  await logSecurityEvent(
    AuditEventType.OTP_VERIFICATION,
    null,
    {
      details: {
        phoneNumber: phone,
        success: isValid,
        attemptNumber: record.attempts
      }
    }
  );

  if (isValid) {
    otpStorage.delete(phone); // Clean up after successful verification
  }

  return isValid;
};