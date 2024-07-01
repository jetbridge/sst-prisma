import type { NextAuthConfig, Session } from 'next-auth';
import { OAuthUserConfig } from 'next-auth/providers';
import CognitoProvider, { CognitoProfile } from 'next-auth/providers/cognito';
import { COGNITO_CLIENT_ID, COGNITO_CLIENT_SECRET, COGNITO_USER_POOL_ID, REGION } from './config';

export const authConfig = {
  providers: [
    CognitoProvider({
      clientId: COGNITO_CLIENT_ID,
      issuer: `https://cognito-idp.${REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}`,
      token: true,

      client: {
        token_endpoint_auth_method: 'none',
      },
      checks: ['pkce', 'state', 'nonce'], // https://github.com/nextauthjs/next-auth/discussions/3551
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;

      return isLoggedIn;
    },

    session: async ({ session, token }) => {
      if (!session?.user || !token?.accessToken) {
        console.error('No accessToken found on token or session');
        return session;
      }
      session.accessToken = token.accessToken as string;
      session.user = token.user as Session['user'];
      session.error = token.error as string | undefined;
      return session;
    },

    jwt: async ({ token, account, user }) => {
      // Initial sign in
      if (account && user) {
        const { id_token, access_token, refresh_token, expires_at } = account;

        return {
          // save token to session for authenticating to AWS
          // https://next-auth.js.org/configuration/callbacks#jwt-callback
          accessToken: access_token,
          accessTokenExpires: expires_at ? expires_at * 1000 : 0,
          refreshToken: refresh_token,
          user,
        };
      }

      return token;
    },
  },
  pages: {
    signIn: '/',
    verifyRequest: '/',
  },
} satisfies NextAuthConfig;
