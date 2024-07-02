import { COGNITO_CLIENT_ID, COGNITO_DOMAIN_NAME } from '@/config'
import { Session } from 'next-auth'
import type { JWT } from 'next-auth/jwt'

interface CognitoRefreshTokenResult {
  access_token: string
  expires_in: number
  id_token: string
  refresh_token: string
}

export const refreshCognitoAccessToken = async (tokens: JWT): Promise<CognitoRefreshTokenResult> => {
  if (!COGNITO_CLIENT_ID) throw new Error('COGNITO_CLIENT_ID is not set')
  if (!COGNITO_DOMAIN_NAME) throw new Error('COGNITO_DOMAIN_NAME is not set')

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
  })

  if (!res.ok) {
    throw new Error(JSON.stringify(await res.json()))
  }

  const newTokens = (await res.json()) as CognitoRefreshTokenResult

  return newTokens
}

export const refreshTokensIfNeeded = async (session: Session): Promise<Session> => {
  // return current token if the access token has not expired yet
  // 10s buffer for clock skew etc
  if (Date.now() + 10000 < session.accessTokenExpires) return session

  // access token has expired, try to get a new one
  const refreshedTokens = await refreshCognitoAccessToken(session)

  // return session with updated tokens
  return {
    ...session,
    accessToken: refreshedTokens?.access_token,
    accessTokenExpires: refreshedTokens?.expires_in ? Date.now() + refreshedTokens?.expires_in * 1000 : 0,
    refreshToken: refreshedTokens?.refresh_token ?? session.refreshToken, // Fall back to old refresh token
  }
}
