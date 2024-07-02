import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager'
import type { Prisma, PrismaClient as PrismaClientType } from '@prisma/client'
import { PrismaClient } from '@prisma/client'
import memoize from 'memoizee'
import { Config } from 'sst/node/config'

export const getPrisma = memoize(async (opts?: Prisma.PrismaClientOptions): Promise<PrismaClientType> => {
  const databaseUrl = await getDatabaseUrl()
  opts = opts || {}
  opts.datasourceUrl ||= databaseUrl

  return new PrismaClient(opts)
})

export const getDatabaseUrl = async (): Promise<string> => {
  let databaseUrl = process.env.DATABASE_URL
  if (process.env.USE_DB_CONFIG !== 'true' && databaseUrl) return databaseUrl

  // load database secret
  const secretArn = Config.DB_SECRET_ARN
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
