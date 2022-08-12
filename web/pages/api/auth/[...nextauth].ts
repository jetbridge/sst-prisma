import NextAuth, { NextAuthOptions } from 'next-auth';
import CognitoProvider from 'next-auth/providers/cognito';
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
    }),
  ],
  // debug: true,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    jwt: async ({ token, account }) => {
      // save token to session for authenticating to AWS
      // https://next-auth.js.org/configuration/callbacks#jwt-callback
      if (account) token.accessToken = account.access_token;
      return token;
    },

    session: async ({ session, token }) => {
      if (!session?.user || !token?.accessToken) {
        console.error('No accessToken found on token or session');
        return session;
      }
      session.user.id = token.sub as string;
      session.user.accessToken = token.accessToken as string;

      return session;
    },
  },

  // TODO: https://next-auth.js.org/adapters/prisma
};

export default NextAuth(authOptions);
