/*
  Run prisma database migrations.

  Not really using a public API.
*/
import type { PrismaClientInitializationError } from '@prisma/client/runtime';
import { Migrate } from '@prisma/migrate/dist/Migrate.js';
import { ensureDatabaseExists } from '@prisma/migrate/dist/utils/ensureDatabaseExists';
import { printFilesFromMigrationIds } from '@prisma/migrate/dist/utils/printFiles';
import chalk from 'chalk';
import { sleep } from 'common';
import { getPrisma, loadDatabaseUrl } from './client';

export const handler = async (): Promise<string> => {
  const schemaPath = './schema.prisma';
  const dbUrl = await loadDatabaseUrl();

  // get DB connection
  try {
    const client = await getPrisma();
    await client.$connect();
  } catch (ex) {
    const errorCode = (ex as PrismaClientInitializationError).errorCode;
    if (errorCode == 'P1001') {
      // timed out waiting to reach DB server
      // it might be waking up from slumber
      // so retry in a short bit
      console.warn('Database not yet available, retrying...');
      await sleep(25_000);
      console.info('Retrying...');

      const client = await getPrisma();
      await client.$connect();
    } else {
      console.error('Failed to run database migrations');
      throw ex;
    }
  }

  process.env.DATABASE_URL = dbUrl;

  const migrate = new Migrate(schemaPath);
  const wasDbCreated = await ensureDatabaseExists('apply', true, schemaPath);
  if (wasDbCreated) {
    console.info(''); // empty line
    console.info(wasDbCreated);
  }

  const diagnoseResult = await migrate.diagnoseMigrationHistory({
    optInToShadowDatabase: false,
  });
  const listMigrationDirectoriesResult = await migrate.listMigrationDirectories();

  if (listMigrationDirectoriesResult.migrations.length > 0) {
    const migrations = listMigrationDirectoriesResult.migrations;
    console.info(`${migrations.length} migration${migrations.length > 1 ? 's' : ''} found in prisma/migrations`);
  } else {
    throw new Error(`No migrations found in prisma/migrations`);
  }

  const editedMigrationNames = diagnoseResult.editedMigrationNames;
  if (editedMigrationNames.length > 0) {
    console.info(
      `${chalk.yellow('WARNING The following migrations have been modified since they were applied:')}
${editedMigrationNames.join('\n')}`
    );
  }

  const { appliedMigrationNames: migrationIds } = await migrate.applyMigrations();

  migrate.stop();

  console.info(''); // empty line
  if (migrationIds.length === 0) {
    return chalk.greenBright(`No pending migrations to apply.`);
  } else {
    return `The following migration${migrationIds.length > 1 ? 's' : ''} have been applied:\n\n${chalk(
      printFilesFromMigrationIds('migrations', migrationIds, {
        'migration.sql': '',
      })
    )}`;
  }
};
