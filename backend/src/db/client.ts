import type { Prisma, PrismaClient as PrismaClientType } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { Config } from 'sst/node/config';
import memoize from 'memoizee';
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';

export const getPrisma = memoize(async (opts?: Prisma.PrismaClientOptions): Promise<PrismaClientType> => {
  return new PrismaClient(opts);
});
