import type { NextAuthConfig } from 'next-auth';
import { OAuthUserConfig } from 'next-auth/providers';
import CognitoProvider, { CognitoProfile } from 'next-auth/providers/cognito';
import { COGNITO_CLIENT_ID, COGNITO_CLIENT_SECRET, COGNITO_USER_POOL_ID, REGION } from './config';

console.log({
  COGNITO_CLIENT_ID,
  COGNITO_CLIENT_SECRET,
  COGNITO_USER_POOL_ID,
  REGION,
});

export const authConfig = {
  providers: [
    CognitoProvider({
      clientId: COGNITO_CLIENT_ID,
      issuer: `https://cognito-idp.${REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}`,
      token: true,

      clientSecret: COGNITO_CLIENT_SECRET,
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
  },
  pages: {
    signIn: '/',
    verifyRequest: '/',
  },
} satisfies NextAuthConfig;
