import type { Prisma, PrismaClient as PrismaClientType } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { Config } from '@serverless-stack/node/config';
import memoize from 'memoizee';
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';

export const loadDatabaseUrl = async (): Promise<string> => {
  let databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) return databaseUrl;

  // load database secret
  // FIXME config
  const secretArn = (Config as any).DB_SECRET_ARN;
  const client = new SecretsManagerClient({});
  const req = new GetSecretValueCommand({ SecretId: secretArn });
  const res = await client.send(req);
  if (!res.SecretString) throw new Error(`Missing secretString in ${secretArn}`);
  const secrets = JSON.parse(res.SecretString);
  const { host, username, password, port, dbname } = secrets;
  if (!host) throw new Error('Missing host in secrets');

  // construct database url
  databaseUrl = `postgresql://${username}:${password}@${host}:${port}/${dbname}?connection_limit=${
    // FIXME config
    (Config as any).PRISMA_CONNECTION_LIMIT || ''
  }`;
  process.env.DATABASE_URL = databaseUrl;
  return databaseUrl;
};

export const getPrisma = memoize(async (opts?: Prisma.PrismaClientOptions): Promise<PrismaClientType> => {
  await loadDatabaseUrl();

  return new PrismaClient(opts);
});
