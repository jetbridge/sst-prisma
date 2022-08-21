/**
 * Environment variables that should be present in backend functions.
 */
export type ENV_VARS_BACKEND = 'DATABASE' | 'DATABASE_URL' | 'CLUSTER_ARN' | 'DB_SECRET_ARN' | 'SST_APP' | 'SST_STAGE';

/**
 * Environment variables that should be present in our frontend.
 */
export type ENV_VARS_FRONTEND = 'GRAPHQL_ENDPOINT' | 'COGNITO_USER_POOL_ID' | 'COGNITO_CLIENT_ID';

export type EnvVar = ENV_VARS_BACKEND | ENV_VARS_FRONTEND;

// typesafe getters
export const envVar = (name: EnvVar): EnvVar => name;

export function requireEnvVar(envVar: EnvVar): string {
  const val = process.env[envVar];
  if (!val) throw new Error(`Missing environment variable:${envVar}`);
  return val;
}

// get current stage
export const STAGE_PROD = 'prod';
export const isProd = (stage?: string) => (stage || getSstStage()) === STAGE_PROD;
export const getSstStage = () => process.env[envVar('SST_STAGE')] || 'unknown';
export const getSstApp = () => process.env[envVar('SST_APP')] || 'unknown';
