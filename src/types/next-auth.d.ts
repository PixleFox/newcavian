import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      phoneNumber?: string;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: string;
    phoneNumber?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    sub?: string;
    role: string;
    phoneNumber?: string;
  }
}

// Extend NodeJS.ProcessEnv with our custom environment variables
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXTAUTH_URL: string;
      NEXTAUTH_SECRET: string;
      JWT_SECRET: string;
      DATABASE_URL: string;
    }
  }
}
