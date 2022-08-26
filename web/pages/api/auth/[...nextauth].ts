import NextAuth, { NextAuthOptions, Session } from 'next-auth';
import CognitoProvider from 'next-auth/providers/cognito';
import { COGNITO_CLIENT_ID, COGNITO_USER_POOL_ID, REGION } from 'web/lib/config/next';
import {
  AuthFlowType,
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { JWT } from 'next-auth/jwt';

if (!REGION) throw new Error('REGION is not set');
if (!COGNITO_CLIENT_ID) throw new Error('COGNITO_CLIENT_ID is not set');
if (!COGNITO_USER_POOL_ID) throw new Error('COGNITO_USER_POOL_ID is not set');

const refreshCognitoAccessToken = async (token: JWT) => {
  const client = new CognitoIdentityProviderClient({ region: REGION });
  const command = new InitiateAuthCommand({
    AuthFlow: AuthFlowType.REFRESH_TOKEN_AUTH,
    ClientId: COGNITO_CLIENT_ID,
    AuthParameters: {
      REFRESH_TOKEN: token.refreshToken as string,
    },
  });
  const response = await client.send(command);
  return response.AuthenticationResult;
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
        accessToken: refreshedTokens?.AccessToken,
        accessTokenExpires: refreshedTokens?.ExpiresIn ? Date.now() + refreshedTokens?.ExpiresIn * 1000 : 0,
        refreshToken: refreshedTokens?.RefreshToken ?? token.refreshToken, // Fall back to old refresh token
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
