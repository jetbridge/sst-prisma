// https://next-auth.js.org/getting-started/typescript#module-augmentation

import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    accessToken: string;
    accessTokenExpires: number;
    refreshToken: string;
    error?: string;
    user: {
      id: string;
    } & DefaultSession['user'];
  }
}
