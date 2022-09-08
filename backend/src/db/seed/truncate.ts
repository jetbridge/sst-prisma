import { Prisma, PrismaClient } from '@prisma/client';
import { isProd } from 'common';

export async function truncateAllTables(prisma: PrismaClient | Prisma.TransactionClient) {
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
