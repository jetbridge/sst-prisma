import { afterEach, beforeEach } from "@jest/globals";
import type { PrismaClient } from "@prisma/client";
import { isProd } from "../env";
import { getPrisma } from "./client";

export async function truncateAllTables(prisma: PrismaClient) {
  if (isProd())
    throw new Error("Please stop whatever you are doing right now.");

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

export const integrationTest = async (
  title: string,
  inner: () => Promise<void>
) => {
  beforeEach(async () => {
    // begin txn ... https://github.com/prisma/prisma/issues/9710
  });

  afterEach(async () => {
    await truncateAllTables(await getPrisma());
    // end txn ...
  });

  it(title, inner);
};

export function areWeTestingWithJest(): boolean {
  return !!process.env.JEST_WORKER_ID;
}
