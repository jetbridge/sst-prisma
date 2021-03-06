import type { PrismaClient as PrismaClientType } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import memoize from 'memoizee';
import { requireSecret } from '../secrets';

export const loadDatabaseUrl = async (): Promise<string> => {
  const databaseUrl = process.env.DATABASE_URL || (await requireSecret('DATABASE_URL'));
  process.env.DATABASE_URL = databaseUrl;
  return databaseUrl;
};

export const getPrisma = memoize(async (): Promise<PrismaClientType> => {
  await loadDatabaseUrl();

  return new PrismaClient();
});
