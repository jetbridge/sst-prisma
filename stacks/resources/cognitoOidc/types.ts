export type OidcProvider = 'GITHUB' | 'LINKEDIN';

export const ENV_OIDC_PROVIDER = 'OIDC_PROVIDER_NAME';

export const ENV_SECRET_NAME = 'OIDC_SECRET_NAME';

export const ENV_COGNITO_REDIRECT_URI = 'COGNITO_REDIRECT_URI';

export interface ProviderConfig {
  providerName: string;
  userPoolId: string;
  clientId: string;
  clientSecret: string;
  oidcApiUrl: string;
}
