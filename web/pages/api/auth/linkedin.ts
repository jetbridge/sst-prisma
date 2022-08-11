import type { NextApiRequest, NextApiResponse } from 'next';
import { getCsrfToken } from 'next-auth/react';
import { COGNITO_CLIENT_ID, COGNITO_DOMAIN_NAME } from 'web/lib/config/next';
import absoluteUrl from 'next-absolute-url';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { origin } = absoluteUrl(req);

  // const callbackUrl = req.query.callbackUrl;
  const redirectUri = `${origin}/login`;
  const csrfToken = await getCsrfToken({ req });

  console.log({ redirectUrl: redirectUri, origin, csrfToken });
  const authRedirect = new URL(`https://${COGNITO_DOMAIN_NAME}/oauth2/authorize`);
  authRedirect.searchParams.append('identity_provider', 'linkedin');
  authRedirect.searchParams.append('redirect_uri', redirectUri);
  authRedirect.searchParams.append('response_type', 'CODE');
  authRedirect.searchParams.append('client_id', COGNITO_CLIENT_ID || 'unset');
  authRedirect.searchParams.append('state', csrfToken || 'unset');
  authRedirect.searchParams.append('scope', 'openid');
  console.log({ authRedirect });

  return res.status(301).setHeader('Location', authRedirect.toString()).send('Redirecting...');
}
