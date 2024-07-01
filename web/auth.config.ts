import type { NextAuthConfig } from 'next-auth';
import { OAuthUserConfig } from 'next-auth/providers';
import CognitoProvider, { CognitoProfile } from 'next-auth/providers/cognito';
import { COGNITO_CLIENT_ID, COGNITO_CLIENT_SECRET, COGNITO_USER_POOL_ID, REGION } from './config';

export const authConfig = {
  providers: [
    CognitoProvider({
      clientId: COGNITO_CLIENT_ID,
      issuer: `https://cognito-idp.${REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}`,

      // use cognito for token signing
      // https://github.com/nextauthjs/next-auth/issues/4707
      clientSecret: COGNITO_CLIENT_SECRET,
      client: {
        token_endpoint_auth_method: 'none',
      },
      // checks: "pkce", // https://github.com/nextauthjs/next-auth/discussions/3551
      checks: ['nonce', 'pkce', 'state'], // https://github.com/nextauthjs/next-auth/discussions/3551
      // checks: "nonce", // https://github.com/nextauthjs/next-auth/discussions/3551
      authorization: { params: { identity_provider: 'Linkedin' } }, // skip cognito hosted UI
      id: 'cognito',
    }),
  ],
  pages: {
    signIn: '/login',
  },
} satisfies NextAuthConfig;
