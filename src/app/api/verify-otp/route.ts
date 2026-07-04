import { NextResponse } from 'next/server';
import { verifyOtp } from '@/lib/otp';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  const { phone, otp } = await req.json();

  // Verify OTP
  const isValid = verifyOtp(phone, otp);
  if (!isValid) {
    return NextResponse.json({ error: 'کد تأیید نامعتبر است' }, { status: 401 });
  }

  try {
    // Find or create user using phone_number
    let user = await prisma.user.findUnique({
      where: { phone_number: phone }, // Use phone_number instead of phone
    });

    if (!user) {
      // Create a new user with default/placeholder values for required fields
      user = await prisma.user.create({
        data: {
          phone_number: phone, // The phone number provided by the user
          full_name: 'کاربر جدید', // Placeholder name
          email: `${phone}@cavian.com`, // Placeholder email
          national_id: '0000000000', // Placeholder national ID
          bank_card_number: '0000000000000000', // Placeholder bank card number
          birth_date: new Date('2000-01-01'), // Placeholder birth date
        },
      });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Error in verify-otp route:', error);
    return NextResponse.json(
      { error: 'خطا در ارتباط با سرور' },
      { status: 500 }
    );
  }
}