/**
 * Format a number as a price in Rial (تومان)
 * @param price - The price to format (in Rial)
 * @returns Formatted price string with commas and تومان suffix
 */
export function formatPrice(price: number): string {
  if (isNaN(price)) return '۰ تومان';
  
  // Convert to string and add commas as thousand separators
  const formattedPrice = new Intl.NumberFormat('fa-IR').format(price);
  
  // Return with Rial symbol (you can replace with تومان if needed)
  return `${formattedPrice} تومان`;
}

/**
 * Truncate text to a specified length and add ellipsis if needed
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Convert a string to a URL-friendly slug
 * @param text - The text to convert to a slug
 * @returns URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/[^\w\u0600-\u06FF\s-]/g, '') // Remove all non-word chars (including Persian)
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/--+/g, '-') // Replace multiple - with single -
    .trim();
}

/**
 * Format a date string to a localized date
 * @param dateString - The date string to format
 * @returns Formatted date string in Persian locale
 */
export function formatDate(dateString: string | Date): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Get the first error message from an error object or string
 * @param error - The error object or string
 * @returns The error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'خطای ناشناخته رخ داده است';
}

/**
 * Debounce a function
 * @param func - The function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Generate a unique ID
 * @returns A unique ID string
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Convert file to base64 string
 * @param file - The file to convert
 * @returns A promise that resolves to the base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Validate an email address
 * @param email - The email to validate
 * @returns Boolean indicating if the email is valid
 */
export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validate a phone number (Iranian format)
 * @param phone - The phone number to validate
 * @returns Boolean indicating if the phone number is valid
 */
export function isValidPhoneNumber(phone: string): boolean {
  const re = /^(\+98|0)?9\d{9}$/;
  return re.test(phone);
}
