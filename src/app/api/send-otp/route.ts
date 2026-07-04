import { NextResponse } from 'next/server';
import { generateOtp, sendOtp, storeOtp } from '@/lib/otp';

export async function POST(req: Request) {
  const { phone } = await req.json();
  
  try {
    const otp = generateOtp();
    await sendOtp(phone, otp);
    storeOtp(phone, otp);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}