/* eslint-disable @typescript-eslint/no-explicit-any */
import { getPublicKey } from './crypto';

export class OpenID {
  service: any;

  constructor(service: any) {
    this.service = service;
  }

  async getJwks() {
    return { keys: [await getPublicKey()] };
  }

  async getUserInfo(accessToken: string) {
    return this.service().getUserInfo(accessToken);
  }

  async getAuthorizeUrl(client_id: any, scope: any, state: any, response_type: any) {
    return this.service().getAuthorizeUrl(client_id, scope, state, response_type);
  }

  async getTokens(code: any, state: any, host: any) {
    return this.service().getToken(code, state, host);
  }

  // might be unused
  getConfigFor(host: any) {
    return {
      issuer: `https://${host}`,
      authorization_endpoint: `https://${host}/auth/oidc/authorize`,
      token_endpoint: `https://${host}/auth/oidc/token`,
      token_endpoint_auth_methods_supported: ['client_secret_basic', 'private_key_jwt'],
      token_endpoint_auth_signing_alg_values_supported: ['RS256'],
      userinfo_endpoint: `https://${host}/auth/oidc/userinfo`,
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
        'vanityName',
        'profile',
        'picture',
        'website',
        'locale',
        'email',
        'email_verified',
        'updated_at',
        'iss',
        'aud',
      ],
    };
  }
}
