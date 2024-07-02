import * as sst from 'sst/constructs'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { AppSyncApi } from './appSyncApi'
import { Auth } from './auth'
import { BastionHost } from './bastionHost'
import { Database, GrantDBAccess } from './database'
import { DatabaseMigrations } from './databaseMigrations'
import { Dns } from './dns'
import { Layers } from './layers'
import { Network } from './network'
import { RestApi } from './restApi'
import { Web } from './web'
import { Aspects } from 'aws-cdk-lib'
import { Secrets } from './secrets'
import { Iam } from './iam'

// deal with dynamic imports of node built-ins (e.g. "crypto")
// from https://github.com/evanw/esbuild/pull/2067#issuecomment-1073039746
// and hardcode __dirname for https://github.com/prisma/prisma/issues/14484
export const ESM_REQUIRE_SHIM = `const require = (await import("node:module")).createRequire(import.meta.url);const __filename = (await import("node:url")).fileURLToPath(import.meta.url);globalThis.__dirname='/var/task';`

export const RUNTIME = Runtime.NODEJS_20_X

export default function main(app: sst.App) {
  app.setDefaultFunctionProps({
    runtime: 'nodejs20.x',
    architecture: 'arm_64',
    environment: {
      NODE_OPTIONS: '--enable-source-maps',
    },
    tracing: 'active',
    nodejs: {
      sourcemap: true,
      esbuild: {
        mainFields: ['module', 'main'],
        minify: true,
        banner: {
          js: ESM_REQUIRE_SHIM,
        },
      },
    },

    // N.B. bundle settings are defined in Layers
  })

  app
    .stack(Network)
    .stack(Iam)
    .stack(Secrets)
    .stack(Dns)
    .stack(Layers)
    .stack(Database)
    .stack(BastionHost)
    .stack(DatabaseMigrations)
    .stack(Auth)
    .stack(RestApi)
    .stack(AppSyncApi)
    .stack(Web)

  // DB access
  const { db, dbAccessSecurityGroup } = sst.use(Database)
  if (db && dbAccessSecurityGroup) Aspects.of(app).add(new GrantDBAccess(db, dbAccessSecurityGroup))
}
