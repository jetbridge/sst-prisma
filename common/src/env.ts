/**
 * Environment variables that should be present in our frontend.
 */
export type ENV_VARS_FRONTEND = 'GRAPHQL_ENDPOINT' | 'COGNITO_USER_POOL_ID' | 'COGNITO_CLIENT_ID';

export type EnvVar = ENV_VARS_FRONTEND;

export function requireEnvVar(envVar: EnvVar): string {
  const val = process.env[envVar];
  if (!val) throw new Error(`Missing environment variable:${envVar}`);
  return val;
}

// get current stage
export const STAGE_PROD = 'prod';
export const isProd = (stage?: string) => (stage || getSstStage()) === STAGE_PROD;
export const getSstStage = () => process.env['SST_STAGE'] || 'unknown';
export const getSstApp = () => process.env['SST_APP'] || 'unknown';
