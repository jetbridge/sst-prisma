// supported providers
export type OidcProvider = 'GITHUB' | 'LINKEDIN';

// env vars for functions
export const ENV_OIDC_PROVIDER = 'OIDC_PROVIDER_NAME';
export const ENV_SECRET_NAME = 'OIDC_SECRET_NAME';
export const ENV_SIGNING_KEY_ARN = 'OIDC_SIGNING_KEY_ARN';
export const ENV_COGNITO_REDIRECT_URI = 'COGNITO_REDIRECT_URI';
