import { getPublicKey } from './crypto';
import { getSecrets } from './secret';

export class OpenID {
  service: any;

  constructor(service: any) {
    this.service = service;
  }

  async getJwks() {
    return { keys: [await getPublicKey()] };
  }

  getUserInfo(accessToken: string) {
    return getSecrets().then((secrets: any) => {
      return this.service(secrets).getUserInfo(accessToken);
    });
  }

  getAuthorizeUrl(client_id: any, scope: any, state: any, response_type: any) {
    return getSecrets().then((secrets) =>
      this.service(secrets).getAuthorizeUrl(client_id, scope, state, response_type)
    );
  }

  getTokens(code: any, state: any, host: any) {
    return getSecrets().then((secrets: any) => {
      return this.service(secrets).getToken(code, state, host);
    });
  }

  getConfigFor(host: any) {
    return {
      issuer: `https://${host}`,
      authorization_endpoint: `https://${host}/auth/oidc/authorize`,
      token_endpoint: `https://${host}/token`,
      token_endpoint_auth_methods_supported: ['client_secret_basic', 'private_key_jwt'],
      token_endpoint_auth_signing_alg_values_supported: ['RS256'],
      userinfo_endpoint: `https://${host}/userinfo`,
      // check_session_iframe: 'https://server.example.com/connect/check_session',
      // end_session_endpoint: 'https://server.example.com/connect/end_session',
      jwks_uri: `https://${host}/.well-known/jwks.json`,
      // registration_endpoint: 'https://server.example.com/connect/register',
      scopes_supported: ['openid', 'read:user', 'user:email'],
      response_types_supported: ['code', 'code id_token', 'id_token', 'token id_token'],

      subject_types_supported: ['public'],
      userinfo_signing_alg_values_supported: ['none'],
      id_token_signing_alg_values_supported: ['RS256'],
      request_object_signing_alg_values_supported: ['none'],
      display_values_supported: ['page', 'popup'],
      claims_supported: [
        'sub',
        'name',
        'preferred_username',
        'profile',
        'picture',
        'website',
        'email',
        'email_verified',
        'updated_at',
        'iss',
        'aud',
      ],
    };
  }
}
