import { OpenID } from '../openid';
import { responder } from './responder';

export const Controller = (openid: OpenID) => (respond: ReturnType<typeof responder>) => ({
  authorize: (client_id: string, scope: string, state: string, response_type: string) => {
    return openid.getAuthorizeUrl(client_id, scope, state, response_type).then((authorizeUrl: string) => {
      console.info('Redirecting to authorizeUrl');
      console.debug('Authorize Url is: %s', authorizeUrl, {});
      respond.redirect(authorizeUrl);
    });
  },
  userinfo: (tokenPromise: Promise<string>) => {
    tokenPromise
      .then((token: string) => openid.getUserInfo(token))
      .then((userInfo: string) => {
        console.debug('Resolved user infos:', userInfo, {});
        respond.success(userInfo);
      })
      .catch((error: any) => {
        console.error('Failed to provide user info: %s', error.message || error, {});
        respond.error(error);
      });
  },
  token: (code: string, state: string, host: string) => {
    if (code) {
      openid
        .getTokens(code, state, host)
        .then((tokens: string) => {
          // console.debug("Token for (%s, %s, %s) provided", code, state, host, {})
          respond.success(tokens);
        })
        .catch((error: string) => {
          console.error('Token for (%s, %s, %s) failed: %s', code, state, host, error.message || error, {});
          respond.error(error);
        });
    } else {
      const error = new Error('No code supplied');
      console.error('Token for (%s, %s, %s) failed: %s', code, state, host, error.message || error, {});
      respond.error(error);
    }
  },
  jwks: () => {
    openid.getJwks().then((jwks) => {
      console.info('Providing access to JWKS: %j', jwks, {});
      respond.success(jwks);
    });
  },
  openIdConfiguration: (host: string) => {
    const config = openid.getConfigFor(host);
    console.info('Providing configuration for %s: %j', host, config, {});
    respond.success(config);
  },
});
