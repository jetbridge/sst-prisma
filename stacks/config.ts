export const IS_PRODUCTION = process.env.IS_PRODUCTION === 'true'
export const RUN_DB_MIGRATIONS = process.env.RUN_DB_MIGRATIONS === 'true'
export const CREATE_AURORA_DATABASE = process.env.CREATE_AURORA_DATABASE === 'true'
export const WEB_DOMAIN = process.env.WEB_DOMAIN
export const HOSTED_ZONE_NAME = process.env.HOSTED_ZONE_NAME
export const PRISMA_CONNECTION_LIMIT = parseInt(process.env.PRISMA_CONNECTION_LIMIT || '15')
export const SSH_KEYPAIR_NAME = process.env.SSH_KEYPAIR_NAME

// for importing existing resources
export const DB_SECURITY_GROUP_ID = process.env.DB_SECURITY_GROUP_ID
export const DB_SNAPSHOT_NAME = process.env.DB_SNAPSHOT_NAME
export const DB_SECRET_NAME = process.env.DB_SECRET_NAME
export const DB_CLUSTER_IDENTIFIER = process.env.DB_CLUSTER_IDENTIFIER
export const DB_CLUSTER_ENDPOINT = process.env.DB_CLUSTER_ENDPOINT
export const DB_NAME = process.env.DB_NAME
export const SECRETS_ARN = process.env.SECRETS_ARN
