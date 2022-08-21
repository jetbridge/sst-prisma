import type { PrismaClient as PrismaClientType } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
// import { Config } from '@serverless-stack/node/config';
import memoize from 'memoizee';
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';

export const loadDatabaseUrl = async (): Promise<string> => {
  let databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) return databaseUrl;

  const secretArn = 'a'; //Config.DB_SECRET_ARN;
  const client = new SecretsManagerClient({});
  const req = new GetSecretValueCommand({ SecretId: secretArn });
  const res = await client.send(req);
  if (!res.SecretString) throw new Error(`Missing secretString in ${secretArn}`);
  const secrets = JSON.parse(res.SecretString);
  const { host, username, password, port, dbname } = secrets;
  if (!host) throw new Error('Missing host in secrets');

  databaseUrl = `postgresql://${username}:${password}@${host}:${port}/${dbname}?connection_limit=${
    // Config.PRISMA_CONNECTION_LIMIT || ''
    ''
  }`;
  process.env.DATABASE_URL = databaseUrl;
  return databaseUrl;
};

export const getPrisma = memoize(async (): Promise<PrismaClientType> => {
  await loadDatabaseUrl();

  return new PrismaClient();
});
