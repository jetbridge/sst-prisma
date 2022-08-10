/**
 * Environment variables that should be present in backend functions.
 */
export type ENV_VARS_BACKEND =
  | 'DATABASE'
  | 'DATABASE_URL'
  | 'CLUSTER_ARN'
  | 'APP_SECRET_ARN'
  | 'DB_SECRET_ARN'
  | 'STAGE';

/**
 * Environment variables that should be present in our frontend.
 */
export type ENV_VARS_FRONTEND = 'GRAPHQL_ENDPOINT' | 'COGNITO_USER_POOL_ID' | 'COGNITO_CLIENT_ID';

/**
 * Secrets that live in Secrets Manager. Edit them manually in the AWS console.
 */
export type APP_SECRETS = 'APP' | 'DATABASE_URL' | 'LINKEDIN_CLIENT_ID' | 'LINKEDIN_CLIENT_SECRET';

export type EnvVar = ENV_VARS_BACKEND | ENV_VARS_FRONTEND;

// typesafe getters
export const envVar = (name: EnvVar): EnvVar => name;
export const secret = (name: APP_SECRETS): APP_SECRETS => name;

export function requireEnvVar(envVar: EnvVar): string {
  const val = process.env[envVar];
  if (!val) throw new Error(`Missing environment variable:${envVar}`);
  return val;
}

// get current stage
export const STAGE_PROD = 'prod';
export const isProd = (stage?: string) => (stage || getEnvName()) === STAGE_PROD;
export type EnvironmentName = string;
export const getEnvName = () => process.env['STAGE'] as EnvironmentName | undefined;
