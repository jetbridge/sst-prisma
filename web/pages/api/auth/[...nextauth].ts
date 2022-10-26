import { decodeJwt } from 'jose';
import NextAuth, { NextAuthOptions, Session } from 'next-auth';
import CognitoProvider from 'next-auth/providers/cognito';
import { refreshTokensIfNeeded } from 'web/lib/client/auth';
import { COGNITO_CLIENT_ID, COGNITO_USER_POOL_ID, REGION } from 'web/lib/config/next';

if (!REGION) throw new Error('REGION is not set');
if (!COGNITO_CLIENT_ID) throw new Error('COGNITO_CLIENT_ID is not set');
if (!COGNITO_USER_POOL_ID) throw new Error('COGNITO_USER_POOL_ID is not set');

export const authOptions: NextAuthOptions = {
  providers: [
    CognitoProvider({
      clientId: COGNITO_CLIENT_ID,
      issuer: `https://cognito-idp.${REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}`,

      // use cognito for token signing
      // https://github.com/nextauthjs/next-auth/issues/4707
      clientSecret: '',
      client: {
        token_endpoint_auth_method: 'none',
      },
      checks: 'nonce', // https://github.com/nextauthjs/next-auth/discussions/3551
      authorization: { params: { identity_provider: 'linkedin' } }, // skip cognito hosted UI
    }),
  ],
  // debug: true,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    // need to handle token refresh https://next-auth.js.org/tutorials/refresh-token-rotation
    // return value is added to Session
    jwt: async ({ token, account, user }) => {
      // Initial sign in
      if (account && user) {
        const { id_token, access_token, refresh_token, expires_at } = account;
        const idTokenDecoded = decodeJwt(id_token as string);

        return {
          // save token to session for authenticating to AWS
          // https://next-auth.js.org/configuration/callbacks#jwt-callback
          accessToken: access_token,
          accessTokenExpires: expires_at ? expires_at * 1000 : 0,
          refreshToken: refresh_token,
          user,
        };
      }

      // already logged-in
      // refresh access token if needed
      const session: Session = token as Session;
      return await refreshTokensIfNeeded(session);
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
  },

  // TODO: https://next-auth.js.org/adapters/prisma
};

export default NextAuth(authOptions);
