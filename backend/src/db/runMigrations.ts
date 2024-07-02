/*
  Run prisma database migrations.

  Not really using a public API.
*/
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'
import { isProd } from '@common/env'
import { PrismaClient } from '@prisma/client'
import { Migrate } from '@prisma/migrate/dist/Migrate.js'
import { ensureDatabaseExists } from '@prisma/migrate/dist/utils/ensureDatabaseExists'
import { printFilesFromMigrationIds } from '@prisma/migrate/dist/utils/printFiles'
import chalk from 'chalk'

export const handler = async (): Promise<string> => {
  const schemaPath = '/var/task/backend/prisma/schema.prisma'
  const dbUrl = await loadDatabaseUrl()

  // get DB connection
  await createDbIfNotExists(dbUrl)
  const client = new PrismaClient()
  await client.$connect()

  process.env.DATABASE_URL = dbUrl

  const migrate = new Migrate(schemaPath)
  // i don't think this really creates the DB and it's not documented
  const wasDbCreated = await ensureDatabaseExists('apply', schemaPath)
  if (wasDbCreated) {
    console.info('') // empty line
    console.info(wasDbCreated)
  }

  const diagnoseResult = await migrate.diagnoseMigrationHistory({
    optInToShadowDatabase: false,
  })
  const listMigrationDirectoriesResult = await migrate.listMigrationDirectories()

  if (listMigrationDirectoriesResult.migrations.length > 0) {
    const migrations = listMigrationDirectoriesResult.migrations
    console.info(`${migrations.length} migration${migrations.length > 1 ? 's' : ''} found in prisma/migrations`)
  } else {
    throw new Error(`No migrations found in prisma/migrations`)
  }

  const editedMigrationNames = diagnoseResult.editedMigrationNames
  if (editedMigrationNames.length > 0) {
    console.info(
      `${chalk.yellow('WARNING The following migrations have been modified since they were applied:')}
${editedMigrationNames.join('\n')}`,
    )
  }

  const { appliedMigrationNames: migrationIds } = await migrate.applyMigrations()

  migrate.stop()

  console.info('') // empty line
  if (migrationIds.length === 0) {
    return chalk.greenBright(`No pending migrations to apply.`)
  } else {
    return `The following migration${migrationIds.length > 1 ? 's' : ''} have been applied:\n\n${chalk(
      printFilesFromMigrationIds('migrations', migrationIds, {
        'migration.sql': '',
      }),
    )}`
  }
}

// like getDatabaseUrl from client.ts but doesn't use SST config
const _getDatabaseUrl = async (): Promise<string> => {
  let databaseUrl = process.env.DATABASE_URL
  if (process.env.USE_DB_CONFIG !== 'true' && databaseUrl) return databaseUrl

  // load database secret
  const secretArn = process.env.DB_SECRET_ARN
  const client = new SecretsManagerClient({})
  const req = new GetSecretValueCommand({ SecretId: secretArn })
  const res = await client.send(req)
  if (!res.SecretString) throw new Error(`Missing secretString in ${secretArn}`)
  const secrets = JSON.parse(res.SecretString) as any
  const { host, username, password, port, dbname } = secrets
  if (!host) throw new Error('Missing host in secrets')

  // construct database url
  databaseUrl = `postgresql://${username}:${password}@${host}:${port}/${dbname}`

  return databaseUrl
}

const loadDatabaseUrl = async (): Promise<string> => {
  const databaseUrl = await _getDatabaseUrl()
  process.env.DATABASE_URL = databaseUrl
  return databaseUrl
}

const createDbIfNotExists = async (dbUrl: string): Promise<void> => {
  // parse DB name from URL
  const dbName = dbUrl.split('/').pop()
  // remove params from name
  const dbNameNoParams = dbName?.split('?')[0]
  // sanitize name
  const dbNameSanitized = dbNameNoParams?.replace(/[^a-zA-Z0-9_]/g, '_')

  // create the database if it doesn't exist
  if (!isProd()) {
    // check if DB exists

    // temporarily set DB to postgres so we can connect
    // parse DSN
    const dsn = dbUrl.split('/')
    dsn.pop() // remove DB name
    // set DB to postgres
    dsn.push('postgres')
    const dbUrlPostgres = dsn.join('/')

    const client = new PrismaClient({ datasources: { db: { url: dbUrlPostgres } } })
    await client.$connect()
    const dbExists = await client.$queryRawUnsafe<unknown[]>(
      `SELECT 1 FROM pg_database WHERE datname = '${dbNameSanitized}'`,
    )
    if (!dbExists.length) {
      console.info(`Database ${dbNameSanitized} does not exist, creating...`)
      await client.$queryRawUnsafe(`CREATE DATABASE ${dbNameSanitized}`)
    }
  }
}
