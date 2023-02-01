import { IncomingMessage } from 'http';
import { decodeJwt } from 'jose';
import { Session } from 'next-auth';
import { getToken, JWT } from 'next-auth/jwt';
import { NextApiRequestCookies } from 'next/dist/server/api-utils';
import { COGNITO_CLIENT_ID, COGNITO_DOMAIN_NAME } from 'web/lib/config/next';

interface CognitoRefreshTokenResult {
  access_token: string;
  expires_in: number;
  id_token: string;
  refresh_token: string;
}

type SsrRequest = IncomingMessage & {
  cookies: NextApiRequestCookies;
};

/**
 * Get current session on the server.
 */
export const getSsrSession = (req: SsrRequest): Promise<Session | null> => getToken({ req }) as Promise<Session | null>;

/**
 * Get access token on the server, refreshing if needed.
 */
export const getSsrFreshAccessToken = async (req: SsrRequest): Promise<string | null> => {
  const session = await getSsrSession(req);
  // if we have an access token and it is expired, get a fresh one
  let accessToken = session?.accessToken;
  if (session && accessToken && isAccessTokenExpired(accessToken)) {
    const newToken = await refreshCognitoAccessToken(session);
    accessToken = newToken.access_token;
  }
  return accessToken ?? null;
};

export const getFreshAccessToken = async (session?: Session): Promise<string | null> => {
  if (!session) return null;
  const refreshedSession = await refreshTokensIfNeeded(session);
  return refreshedSession?.accessToken ?? null;
};

export const refreshTokensIfNeeded = async (session: Session): Promise<Session> => {
  // return current token if the access token has not expired yet
  // 10s buffer for clock skew etc
  if (Date.now() + 10000 < session.accessTokenExpires) return session;

  // access token has expired, try to get a new one
  const refreshedTokens = await refreshCognitoAccessToken(session);

  // return session with updated tokens
  return {
    ...session,
    accessToken: refreshedTokens?.access_token,
    accessTokenExpires: refreshedTokens?.expires_in ? Date.now() + refreshedTokens?.expires_in * 1000 : 0,
    refreshToken: refreshedTokens?.refresh_token ?? session.refreshToken, // Fall back to old refresh token
  };
};

/**
 * Decode JWT and check expiration time.
 * @param accessTokenEncoded encoded JWT string
 * Unused.
 */
const isAccessTokenExpired = (accessTokenEncoded: string): boolean => {
  const accessTokenDecoded = decodeJwt(accessTokenEncoded as string);
  if (!accessTokenDecoded) return true;
  if (!accessTokenDecoded.exp) throw new Error('access token does not have an expiration');
  return accessTokenDecoded.exp * 1000 < Date.now() + 5000;
};

export const refreshCognitoAccessToken = async (tokens: JWT): Promise<CognitoRefreshTokenResult> => {
  if (!COGNITO_CLIENT_ID) throw new Error('COGNITO_CLIENT_ID is not set');
  if (!COGNITO_DOMAIN_NAME) throw new Error('COGNITO_DOMAIN_NAME is not set');

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
