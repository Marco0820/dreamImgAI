import 'next-auth';
import { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface User extends DefaultUser {
    id: string; // Ensure id is string as returned by NextAuth
    credits: number;
    creemPriceId?: string | null;
  }

  interface Session {
    accessToken?: string;
    user: User & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    idToken?: string;
    credits: number;
    creemPriceId?: string | null;
  }
} 