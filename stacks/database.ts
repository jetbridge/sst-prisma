import { APP_NAME } from '@common/index'
import { Duration, IAspect, RemovalPolicy } from 'aws-cdk-lib'
import { ISecurityGroup, IVpc, Port, SecurityGroup } from 'aws-cdk-lib/aws-ec2'
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam'
import { CfnFunction } from 'aws-cdk-lib/aws-lambda'
import {
  AuroraCapacityUnit,
  AuroraPostgresEngineVersion,
  ClusterInstance,
  Credentials,
  DatabaseCluster,
  DatabaseClusterEngine,
  IServerlessCluster,
  ParameterGroup,
  ServerlessClusterFromSnapshot,
  ServerlessClusterProps,
  SnapshotCredentials,
} from 'aws-cdk-lib/aws-rds'
import { ISecret, Secret } from 'aws-cdk-lib/aws-secretsmanager'
import { Construct, IConstruct } from 'constructs'
import { config } from 'dotenv'
import { App, Config, Function, Script, Stack, StackContext, use } from 'sst/constructs'
import { Network } from 'stacks/network'
import {
  CREATE_AURORA_DATABASE,
  DB_CLUSTER_ENDPOINT,
  DB_CLUSTER_IDENTIFIER,
  DB_NAME,
  DB_SECRET_NAME,
  DB_SECURITY_GROUP_ID,
  DB_SNAPSHOT_NAME,
  IS_PRODUCTION,
  PRISMA_CONNECTION_LIMIT,
} from './config'

// if no parameter group specified, log queries that take at least this long
export const logMinDurationStatementDefault = 90 // ms

export function Database({ stack, app }: StackContext) {
  const { vpc, defaultLambdaSecurityGroup } = use(Network)
  const createDatabase = CREATE_AURORA_DATABASE && !app.local

  if (!createDatabase) return {}

  const defaultDatabaseName = APP_NAME

  const dbSecurityGroupId = DB_SECURITY_GROUP_ID
  const dbAccessSecurityGroup = dbSecurityGroupId
    ? SecurityGroup.fromSecurityGroupId(stack, 'DbAccessSecurityGroup', dbSecurityGroupId)
    : new SecurityGroup(stack, 'DatabaseAccessSecurityGroup', {
        vpc,
        description: 'Allow access to the database',
      })

  let db: DatabaseWithSecret | undefined = undefined

  // database settings
  const dbProps: DatabaseProps & Partial<ServerlessClusterProps> = {
    engine: DatabaseClusterEngine.AURORA_POSTGRESQL,
    vpc,
    parameterGroup: new ParameterGroup(stack, 'ParamGroup', {
      parameters: { log_min_duration_statement: `${logMinDurationStatementDefault}` },
      engine: DatabaseClusterEngine.auroraPostgres({ version: AuroraPostgresEngineVersion.VER_16_2 }),
    }),

    deletionProtection: IS_PRODUCTION,
    removalPolicy: IS_PRODUCTION ? RemovalPolicy.RETAIN : RemovalPolicy.SNAPSHOT,
    backupRetention: IS_PRODUCTION ? Duration.days(10) : Duration.days(5),
    scaling: {
      minCapacity: AuroraCapacityUnit.ACU_2,

      // set to higher number to pay more money if there is heavy load
      maxCapacity: AuroraCapacityUnit.ACU_4,

      // go to sleep to save money?
      autoPause: IS_PRODUCTION ? Duration.hours(0) : Duration.hours(8),
    },
    defaultDatabaseName: getDefaultDatabaseName(),
  } as const

  // DB config
  const dbSnapshotName = DB_SNAPSHOT_NAME
  const dbSecretName = DB_SECRET_NAME

  // DB credentials - import or generate
  const dbSecret = dbSecretName
    ? Secret.fromSecretNameV2(stack, 'DbSecretImported', dbSecretName)
    : new Secret(stack, 'DbSecretGenerated', {
        secretName: app.logicalPrefixedName('db'),
        description: `DB secret for ${app.logicalPrefixedName('db')}`,
        removalPolicy: RemovalPolicy.RETAIN,
        generateSecretString: {
          secretStringTemplate: JSON.stringify({ username: 'postgres' }),
          generateStringKey: 'password',
          excludePunctuation: true,
        },
      })

  // create DB or use snapshot or import existing for dev environments
  const existingDbId = DB_CLUSTER_IDENTIFIER
  if (existingDbId) {
    // import existing DB
    const clusterEndpointAddress = DB_CLUSTER_ENDPOINT
    db = ServerlessDatabaseCluster.fromDatabaseClusterAttributes(stack, 'DatabaseImported', {
      clusterIdentifier: existingDbId,
      port: 5432,
      clusterEndpointAddress,
      securityGroups: [dbAccessSecurityGroup],
    })
    db.secret = dbSecret
  } else if (dbSnapshotName) {
    // from snapshot
    db = new DatabaseFromSnapshot(stack, 'DB', {
      ...dbProps,
      engine: DatabaseClusterEngine.AURORA_POSTGRESQL,
      snapshotIdentifier: dbSnapshotName,
      credentials: SnapshotCredentials.fromSecret(dbSecret),
      securityGroups: [dbAccessSecurityGroup],
    })
  } else {
    db = new ServerlessDatabaseCluster(stack, 'DB', {
      ...dbProps,
      engine: DatabaseClusterEngine.auroraPostgres({ version: AuroraPostgresEngineVersion.VER_16_2 }),
      credentials: Credentials.fromSecret(dbSecret),
      writer: ClusterInstance.serverlessV2('writer'),
      securityGroups: [dbAccessSecurityGroup],
    })
  }

  // allow stack security group to access the database
  if (db.connections)
    db.connections.allowFrom(dbAccessSecurityGroup, Port.tcp(5432), 'Allow access from DB access security group')

  db.connections.allowDefaultPortFrom(defaultLambdaSecurityGroup, 'Allow access from lambda functions')

  const prismaConnectionLimit = PRISMA_CONNECTION_LIMIT

  const config = [
    new Config.Parameter(stack, 'DATABASE_NAME', { value: defaultDatabaseName }),
    new Config.Parameter(stack, 'CLUSTER_ARN', { value: db.clusterArn }),
    new Config.Parameter(stack, 'DB_SECRET_ARN', { value: db.secret?.secretArn ?? '' }),
    new Config.Parameter(stack, 'PRISMA_CONNECTION_LIMIT', { value: prismaConnectionLimit.toString() ?? '' }),
  ]

  stack.addOutputs({
    DBName: { value: defaultDatabaseName, description: 'Name of the default database' },
    GetDatabaseSecretsCommand: {
      value: `aws secretsmanager get-secret-value --region ${stack.region} --secret-id ${db.secret?.secretArn ?? 'unknown'} --query SecretString --output text`,
      description: 'Command to get DB connection info and credentials',
    },
  })
  app.addDefaultFunctionBinding(config)

  // DB connection for local dev can be overridden
  // https://docs.sst.dev/environment-variables#is_local
  const localDatabaseUrl = process.env['DATABASE_URL']
  if (app.local && localDatabaseUrl) {
    app.addDefaultFunctionEnv({
      ['DATABASE_URL']: localDatabaseUrl,
    })
  }

  if (dbSecret) {
    app.addDefaultFunctionPermissions([
      new PolicyStatement({
        effect: Effect.ALLOW,
        resources: [dbSecret.secretArn],
        actions: ['secretsmanager:GetSecretValue'],
      }),
    ])
  }

  return { db, defaultDatabaseName, dbAccessSecurityGroup }
}

///////

export const prismaCommandHooks = {
  beforeInstall: (): string[] => [],
  afterBundling: (_inputDir: string, outputDir: string): string[] => [`rm -rf ${outputDir}/package-lock.json`],
  beforeBundling: (inputDir: string, outputDir: string): string[] => [
    // need to copy over prisma dir with migrations
    `cp -r "${inputDir}/backend/prisma" "${outputDir}"`,
  ],
}

export type DatabaseType = ServerlessDatabaseCluster | DatabaseFromSnapshot

/**
 * Generate a database connection string (DSN).
 */
function makeDatabaseUrl(db: DatabaseWithSecret): string {
  const _secret = db.secret
  const dbUsername = _secret?.secretValueFromJson('username')
  const dbPassword = _secret?.secretValueFromJson('password')
  if (!dbUsername || !dbPassword) throw new Error('missing db credentials')

  const defaultDatabaseName = getDefaultDatabaseName()
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  let url = `postgresql://${dbUsername}:${dbPassword}@${db.clusterEndpoint.hostname}/${defaultDatabaseName}`

  const prismaConnectionLimit = PRISMA_CONNECTION_LIMIT
  if (prismaConnectionLimit) url += `?connection_limit=${prismaConnectionLimit}`

  return url
}

export function makeDatabaseConfigs(
  stack: Stack,
  db: DatabaseWithSecret,
): Record<string, Config.Secret | Config.Parameter> {
  const _secret = db.secret
  const app = App.of(stack) as App

  config({ path: 'backend/.env' })
  const localDatabaseUrl = process.env['DATABASE_URL']
  if (app.local || localDatabaseUrl) {
    if (!localDatabaseUrl) throw new Error('localDatabaseUrl not set')
    const dbName = localDatabaseUrl.split('/').pop()

    return {
      databaseName: new Config.Parameter(stack, 'databaseName', { value: dbName || getDefaultDatabaseName() }),
      useLocalDb: new Config.Parameter(stack, 'useLocalDb', { value: 'true' }),
    }
  }

  return {
    databaseName: new Config.Parameter(stack, 'databaseName', { value: getDefaultDatabaseName() }),
    databaseClusterArn: new Config.Parameter(stack, 'databaseArn', { value: db.clusterArn }),
    databaseSecretArn: new Config.Parameter(stack, 'databaseSecretArn', { value: _secret?.secretArn ?? 'UNKNOWN' }),
  }
}

export interface DatabaseProps {
  vpc: IVpc
  prismaConnectionLimit?: number
}

export interface DatabaseWithSecret extends IServerlessCluster {
  secret?: ISecret
}

export function getDefaultDatabaseName(): string {
  return DB_NAME || APP_NAME
}

export class ServerlessDatabaseCluster extends DatabaseCluster {
  /**
   * Get params for connecting via data API.
   * Make sure you set enableDataApi: true
   * or call grantDataApiAccess()
   */
  getDataApiParams() {
    if (!this.secret) throw new Error('cluster missing secret')
    return {
      clusterArn: this.clusterArn,
      secretArn: this.secret.secretArn,
    }
  }
}

export class DatabaseFromSnapshot extends ServerlessClusterFromSnapshot {
  getDataApiParams() {
    if (!this.secret) throw new Error('cluster missing secret')
    return {
      clusterArn: this.clusterArn,
      secretArn: this.secret.secretArn,
    }
  }
}

export class DatabaseSeedScript extends Construct {
  constructor(scope: Construct, id: string, { vpc }: Pick<DatabaseProps, 'vpc'>) {
    super(scope, id)

    const seedFunction = new Function(this, 'SeedScriptLambda', {
      vpc,
      handler: 'lib/lambdas/database/seedDev.handler',
      enableLiveDev: false,
      timeout: '10 minutes',
    })
    new Script(this, 'SeedScript', {
      onCreate: seedFunction,
    })
  }
}

/**
 * Grants functions access to the DB.
 */
export class GrantDBAccess implements IAspect {
  constructor(
    protected database: IServerlessCluster,
    protected dbAccessSecurityGroup: ISecurityGroup,
  ) {}

  public visit(node: IConstruct): void {
    if (!(node instanceof Function)) return

    const app = App.of(node) as App
    if (!app) return

    // override database for local dev
    if (app.local) {
      // load backend/prisma/.env.test
      config({ path: 'backend/.env' })
      const localDatabaseUrl = process.env['DATABASE_URL']
      if (!localDatabaseUrl) throw new Error('localDatabaseUrl not set')
      app.addDefaultFunctionEnv({ ['DATABASE_URL']: localDatabaseUrl })
    }

    // allow to connect to postgres
    // (this is a hack to add a security group to the function)
    const funcCfn = node.node.defaultChild as CfnFunction
    const vpcConfig = funcCfn.vpcConfig
    if (!vpcConfig) throw new Error('Missing VPC Config on lambda function: ' + node.toString())
    ;(vpcConfig as any).securityGroupIds ||= []
    ;(vpcConfig as any).securityGroupIds.push(this.dbAccessSecurityGroup.securityGroupId)

    // to enable one day:
    // db.grantDataApiAccess(func)
    // if (db.secret) {
    //   // should be used but isn't
    //   func.addEnvironment(EnvVars.dbSecretsArn, db.secret.secretArn)
    //   db.secret.grantRead(func)
  }
}
