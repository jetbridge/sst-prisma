/*
  Run prisma database migrations.

  Not really using a public API.
*/
import type { PrismaClientInitializationError } from '@prisma/client/runtime';
import { Migrate } from '@prisma/migrate/dist/Migrate.js';
import { ensureDatabaseExists } from '@prisma/migrate/dist/utils/ensureDatabaseExists';
import { printFilesFromMigrationIds } from '@prisma/migrate/dist/utils/printFiles';
import chalk from 'chalk';
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { PrismaClient } from '@prisma/client';
import { sleep, isProd } from 'common';

export const handler = async (): Promise<string> => {
  const schemaPath = '/var/task/backend/prisma/schema.prisma';
  const dbUrl = await loadDatabaseUrl();

  // get DB connection
  try {
    await createDbIfNotExists(dbUrl);
    const client = new PrismaClient();
    await client.$connect();
  } catch (ex) {
    const errorCode = (ex as PrismaClientInitializationError).errorCode;
    if (errorCode == 'P1001') {
      // timed out waiting to reach DB server
      // it might be waking up from slumber
      // so retry in a short bit
      console.warn('Database not yet available, retrying...');
      await sleep(30_000);
      console.info('Retrying...');

      await createDbIfNotExists(dbUrl);
      const client = new PrismaClient();
      await client.$connect();
    } else {
      console.error('Failed to run database migrations');
      throw ex;
    }
  }

  process.env.DATABASE_URL = dbUrl;

  const migrate = new Migrate(schemaPath);
  // i don't think this really creates the DB and it's not documented
  const wasDbCreated = await ensureDatabaseExists('apply', schemaPath);
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

const loadDatabaseUrl = async (): Promise<string> => {
  let databaseUrl = process.env.DATABASE_URL;
  if (process.env.USE_DB_CONFIG !== 'true' && databaseUrl) return databaseUrl;

  // load database secret
  // FIXME config
  const secretArn = process.env.DB_SECRET_ARN;
  const client = new SecretsManagerClient({});
  const req = new GetSecretValueCommand({ SecretId: secretArn });
  const res = await client.send(req);
  if (!res.SecretString) throw new Error(`Missing secretString in ${secretArn}`);
  const secrets = JSON.parse(res.SecretString);
  const { host, username, password, port, dbname } = secrets;
  if (!host) throw new Error('Missing host in secrets');

  // construct database url
  databaseUrl = `postgresql://${username}:${password}@${host}:${port}/${dbname}`;
  process.env.DATABASE_URL = databaseUrl;
  return databaseUrl;
};

const createDbIfNotExists = async (dbUrl: string): Promise<void> => {
  // parse DB name from URL
  const dbName = dbUrl.split('/').pop();
  // remove params from name
  const dbNameNoParams = dbName?.split('?')[0];
  // sanitize name
  const dbNameSanitized = dbNameNoParams?.replace(/[^a-zA-Z0-9_]/g, '_');

  // create the database if it doesn't exist
  if (!isProd()) {
    // check if DB exists

    // temporarily set DB to postgres so we can connect
    // parse DSN
    const dsn = dbUrl.split('/');
    dsn.pop(); // remove DB name
    // set DB to postgres
    dsn.push('postgres');
    const dbUrlPostgres = dsn.join('/');

    const client = new PrismaClient({ datasources: { db: { url: dbUrlPostgres } } });
    await client.$connect();
    const dbExists = await client.$queryRawUnsafe<unknown[]>(
      `SELECT 1 FROM pg_database WHERE datname = '${dbNameSanitized}'`
    );
    if (!dbExists.length) {
      console.info(`Database ${dbNameSanitized} does not exist, creating...`);
      await client.$queryRawUnsafe(`CREATE DATABASE ${dbNameSanitized}`);
    }
  }
};
