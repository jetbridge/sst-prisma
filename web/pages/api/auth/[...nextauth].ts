import NextAuth, { NextAuthOptions, Session } from 'next-auth';
import CognitoProvider from 'next-auth/providers/cognito';
import { COGNITO_CLIENT_ID, COGNITO_DOMAIN_NAME, COGNITO_USER_POOL_ID, REGION } from 'web/lib/config/next';
import { JWT } from 'next-auth/jwt';

if (!REGION) throw new Error('REGION is not set');
if (!COGNITO_CLIENT_ID) throw new Error('COGNITO_CLIENT_ID is not set');
if (!COGNITO_USER_POOL_ID) throw new Error('COGNITO_USER_POOL_ID is not set');

interface CognitoRefreshTokenResult {
  access_token: string;
  expires_in: number;
  id_token: string;
  refresh_token: string;
}

const refreshCognitoAccessToken = async (tokens: JWT): Promise<CognitoRefreshTokenResult> => {
  const res = await fetch(`https://${COGNITO_DOMAIN_NAME}/oauth2/token`, {
    method: 'POST',
    headers: new Headers({ 'content-type': 'application/x-www-form-urlencoded' }),
    body: Object.entries({
      grant_type: 'refresh_token',
      client_id: COGNITO_CLIENT_ID,
      refresh_token: tokens.refreshToken,
    })
      .map(([k, v]) => `${k}=${v}`)
      .join('&'),
  });
  if (!res.ok) {
    throw new Error(JSON.stringify(await res.json()));
  }
  const newTokens = await res.json();
  return newTokens;
};

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
      // authorization: { params: { identity_provider: 'linkedin' } }, // skip cognito hosted UI
    }),
  ],
  // debug: true,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    // need to handle token refresh https://next-auth.js.org/tutorials/refresh-token-rotation
    jwt: async ({ token, account, user }) => {
      // Initial sign in
      if (account && user) {
        return {
          // save token to session for authenticating to AWS
          // https://next-auth.js.org/configuration/callbacks#jwt-callback
          accessToken: account.access_token,
          accessTokenExpires: account.expires_at ? account.expires_at * 1000 : 0,
          refreshToken: account.refresh_token,
          user,
        };
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token as Session).accessTokenExpires) {
        return token;
      }

      // Access token has expired, try to get a new one
      const refreshedTokens = await refreshCognitoAccessToken(token);
      return {
        ...token,
        accessToken: refreshedTokens?.access_token,
        accessTokenExpires: refreshedTokens?.expires_in ? Date.now() + refreshedTokens?.expires_in * 1000 : 0,
        refreshToken: refreshedTokens?.refresh_token ?? token.refreshToken, // Fall back to old refresh token
      };
    },

    session: async ({ session, token }) => {
      if (!session?.user || !token?.accessToken) {
        console.error('No accessToken found on token or session');
        return session;
      }
      session.user = token.user as Session['user'];
      session.accessToken = token.accessToken as string;
      session.error = token.error as string | undefined;

      return session;
    },
  },

  // TODO: https://next-auth.js.org/adapters/prisma
};

export default NextAuth(authOptions);
