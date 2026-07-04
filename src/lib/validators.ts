export function validatePhoneNumber(phone: string) {
    const regex = /^\+98[0-9]{10}$/;
    if (!regex.test(phone)) {
      throw new Error('Phone number must be in format +989123456789');
    }
  }
  
  export function validateEmail(email: string | null | undefined) {
    if (!email) return;
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!regex.test(email)) {
      throw new Error('Invalid email format');
    }
  }