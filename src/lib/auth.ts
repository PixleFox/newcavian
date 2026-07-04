import { NextRequest } from 'next/server';
import { NextAuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from './prisma';
import jwt from 'jsonwebtoken';
import { compare } from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        phoneNumber: { label: 'Phone Number', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const admin = await prisma.admin.findUnique({
          where: { phoneNumber: credentials.phoneNumber },
        });

        if (!admin || !admin.passwordHash) return null;

        const isValid = await compare(credentials.password, admin.passwordHash);

        if (!isValid) return null;

        return {
          id: admin.id.toString(),
          phoneNumber: admin.phoneNumber,
          name: `${admin.firstName} ${admin.lastName}`,
          email: admin.email,
          role: admin.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.phoneNumber = user.phoneNumber;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.phoneNumber = token.phoneNumber;
      }
      return session;
    },
  },
  pages: {
    signIn: '/admin/login', // Custom sign in page
  },
  secret: process.env.NEXTAUTH_SECRET || JWT_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

export interface AdminSession {
  admin: {
    id: number;
    phoneNumber: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

/**
 * Gets the current admin session from a request
 */
export async function getSession(request?: NextRequest): Promise<AdminSession | null> {
  try {
    // Extract admin-auth cookie
    const cookies = request?.cookies || new Map();
    const adminAuthCookie = cookies.get('admin-auth')?.value;

    if (!adminAuthCookie) {
      return null;
    }

    // Verify JWT token
    const decoded = jwt.verify(adminAuthCookie, JWT_SECRET) as {
      adminId: number;
      phoneNumber: string;
      iat: number;
      exp: number;
    };

    // Verify admin exists and is active
    const admin = await prisma.admin.findUnique({
      where: {
        id: decoded.adminId,
        phoneNumber: decoded.phoneNumber,
        isActive: true,
      },
      select: {
        id: true,
        phoneNumber: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    if (!admin) {
      return null;
    }

    // Verify session exists and is valid
    const session = await prisma.adminSession.findFirst({
      where: {
        adminId: admin.id,
        tokenHash: adminAuthCookie,
        isValid: true,
        expiresAt: { gt: new Date() },
      },
    });

    if (!session) {
      return null;
    }

    return { admin };
  } catch (error) {
    return null;
  }
}

/**
 * Gets the client IP address from a request
 */
export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';
  return ip === '::1' ? '127.0.0.1' : ip;
}

/**
 * Gets the user agent from a request
 */
export function getUserAgent(request: NextRequest): string {
  const userAgent = request.headers.get('user-agent') || 'Unknown';
  return userAgent.length > 255 ? userAgent.substring(0, 255) : userAgent;
}
