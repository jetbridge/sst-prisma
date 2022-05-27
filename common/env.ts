export const ENV_VARS = {
  DATABASE: 'DATABASE',
  DATABASE_URL: 'DATABASE_URL',
  CLUSTER_ARN: 'CLUSTER_ARN',
  APP_SECRET_ARN: 'APP_SECRET_ARN',
  DB_SECRET_ARN: 'DB_SECRET_ARN',
  STAGE: 'STAGE',
} as const;

export const APP_SECRETS = {
  APP: 'APP',
  DATABASE_URL: 'DATABASE_URL',
};

type EnvVar = typeof ENV_VARS[keyof typeof ENV_VARS];

export function requireEnvVar(envVar: EnvVar): string {
  const val = process.env[envVar];
  if (!val) throw new Error(`Missing environment variable:${envVar}`);
  return val;
}

// get current stage
export const STAGE_PROD = 'prod';
export const isProd = (stage?: string) => (stage || getEnvName()) === STAGE_PROD;
export type EnvironmentName = string;
export const getEnvName = () => process.env[ENV_VARS.STAGE] as EnvironmentName | undefined;
