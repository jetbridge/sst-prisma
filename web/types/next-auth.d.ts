// https://next-auth.js.org/getting-started/typescript#module-augmentation

import NextAuth, { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      accessToken: string;
    } & DefaultSession['user'];
  }
}
