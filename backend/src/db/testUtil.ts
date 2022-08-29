import { PrismaTestingHelper } from '@chax-at/transactional-prisma-testing';
import { PrismaClient } from '@prisma/client';
import { isProd } from 'common';

export async function truncateAllTables(prisma: PrismaClient) {
  if (isProd()) throw new Error('Please stop whatever you are doing right now.');

  await prisma.$executeRawUnsafe(`
      DO $$ DECLARE
          r RECORD;
      BEGIN
          FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = current_schema() AND tableowner = user) LOOP
              EXECUTE 'TRUNCATE TABLE  ' || quote_ident(r.tablename) || ' CASCADE';
          END LOOP;
      END $$;
      `);
}

const prismaClient = new PrismaClient();
await truncateAllTables(prismaClient); // can be skipped for speed maybe

// create prisma proxy to wrap all tests in a transaction
const prismaTestingHelper = new PrismaTestingHelper(prismaClient);
vi.mock('@backend/db/client', async () => {
  const actual = await vi.importActual<typeof import('@backend/db/client')>('@backend/db/client');

  return {
    ...actual,
    getPrisma: async () => {
      return prismaTestingHelper.getProxyClient();
    },
  };
});

/**
 * Define a database integration test suite.
 * Clears DB contents after running each test in an isolated transaction.
 *
 * ⚠️ This must be imported first in your test suite!
 */
export const describeIntegrationTest = (title: string, inner: () => void) => {
  beforeEach(async () => {
    await prismaTestingHelper.startNewTransaction();
  });

  afterEach(async () => {
    await prismaTestingHelper?.rollbackCurrentTransaction();
  });

  describe(title, inner);
};
