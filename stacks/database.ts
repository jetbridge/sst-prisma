import { Config, RDS, StackContext, use } from '@serverless-stack/resources';

import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import { APP_NAME } from 'common';
import { Network } from 'stacks/network';
import { IS_PRODUCTION } from './config';

export function Database({ stack, app }: StackContext) {
  const net = use(Network);

  const defaultDatabaseName = APP_NAME;
  const rds = new RDS(stack, 'DB', {
    cdk: {
      cluster: {
        vpc: net.vpc,
        removalPolicy: IS_PRODUCTION ? RemovalPolicy.SNAPSHOT : RemovalPolicy.DESTROY,
      },
    },
    engine: 'postgresql10.14',
    defaultDatabaseName,
    scaling: {
      autoPause: IS_PRODUCTION
        ? false
        : // go to sleep after this length of inactivity
          Duration.hours(4).toMinutes(),
      minCapacity: 'ACU_2',
      maxCapacity: 'ACU_4',
    },
  });

  const { cluster } = rds.cdk;

  cluster.connections.allowDefaultPortFrom(net.defaultLambdaSecurityGroup, 'Allow access from lambda functions');

  const prismaConnectionLimit = process.env.PRISMA_CONNECTION_LIMIT || 5;

  const config = [
    new Config.Parameter(stack, 'DATABASE_NAME', { value: defaultDatabaseName }),
    new Config.Parameter(stack, 'CLUSTER_ARN', { value: rds.clusterArn }),
    new Config.Parameter(stack, 'DB_SECRET_ARN', { value: rds.secretArn }),
    new Config.Parameter(stack, 'PRISMA_CONNECTION_LIMIT', { value: prismaConnectionLimit.toString() ?? '' }),
  ];

  stack.addOutputs({
    DBName: { value: defaultDatabaseName, description: 'Name of the default database' },
    GetSecretsCommand: {
      value: `aws secretsmanager get-secret-value --region ${stack.region} --secret-id ${rds.secretArn} --query SecretString --output text`,
      description: 'Command to get DB connection info and credentials',
    },
  });
  app.addDefaultFunctionPermissions([rds]);
  app.setDefaultFunctionProps({ config });

  // DB connection for local dev can be overridden
  // https://docs.sst.dev/environment-variables#is_local
  const localDatabaseUrl = process.env['DATABASE_URL'];
  if (process.env.IS_LOCAL && localDatabaseUrl) {
    app.addDefaultFunctionEnv({
      ['DATABASE_URL']: localDatabaseUrl,
    });
  }

  return { rds, cluster, defaultDatabaseName };
}

/**
 * Generate a database connection string (DSN).
 */
export function makeDatabaseUrl() {
  const prismaConnectionLimit = process.env.PRISMA_CONNECTION_LIMIT || 5;

  const rds = use(Database);
  const { cluster, defaultDatabaseName } = rds;
  const dbUsername = cluster.secret?.secretValueFromJson('username');
  const dbPassword = cluster.secret?.secretValueFromJson('password');

  return `postgresql://${dbUsername}:${dbPassword}@${cluster.clusterEndpoint.hostname}/${defaultDatabaseName}?connection_limit=${prismaConnectionLimit}`;
}
