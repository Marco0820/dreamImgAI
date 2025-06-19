import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    accessToken?: string;
    user?: {
      id: string;
      credits: number;
      is_premium?: boolean;
      creemPriceId?: string | null;
    } & DefaultSession['user'];
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * available here as `user`.
   */
  interface User {
    is_premium?: boolean;
    credits?: number;
    creemPriceId?: string | null;
  }
} 