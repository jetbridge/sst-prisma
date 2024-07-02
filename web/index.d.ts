////

// https://next-auth.js.org/getting-started/typescript#module-augmentation
import type { DefaultSession, User } from 'next-auth';
import { AdapterUser } from 'next-auth/adapters';
import type { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session extends JWT {
    accessToken: string;
    accessTokenExpires: number;
    refreshToken: string;
    error?: string;
    isImpersonating?: boolean;
    user: User & AdapterUser;
  }
}
