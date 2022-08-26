/* eslint-disable @typescript-eslint/no-explicit-any */
import { OpenID } from '../openid';
import { Responder } from './responder';

export const Controller = (openid: OpenID) => ({
  authorize: async (client_id: string, scope: string, state: string, response_type: string) => {
    const authorizeUrl = await openid.getAuthorizeUrl(client_id, scope, state, response_type);
    console.info('Redirecting to authorizeUrl');
    console.debug('Authorize Url is: %s', authorizeUrl, {});
    return Responder.redirect(authorizeUrl);
  },
  userinfo: async (tokenPromise: Promise<string>) => {
    const token = await tokenPromise;
    const userInfo = await openid.getUserInfo(token);
    console.debug('Resolved user info:', userInfo);
    return Responder.success(userInfo);
  },
  token: async (code: string, state: string, host: string) => {
    if (code) {
      const tokens = await openid.getTokens(code, state, host);
      return Responder.success(tokens);
    } else {
      const error = new Error('No code supplied');
      console.error('Token for (%s, %s, %s) failed: %s', code, state, host, error.message || error, {});
      return Responder.error(error);
    }
  },
  jwks: async () => {
    const jwks = await openid.getJwks();
    console.info('Returning JWKS:', jwks);
    return Responder.success(jwks);
  },
  openIdConfiguration: (host: string) => {
    const config = openid.getConfigFor(host);
    console.info('Providing configuration for %s', host, config);
    return Responder.success(config);
  },
});
