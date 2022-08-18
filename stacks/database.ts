import { RDS, StackContext, use } from '@serverless-stack/resources';

import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import { APP_NAME, envVar } from 'common';
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
      autoPause: IS_PRODUCTION ? false : Duration.hours(5).toMinutes(),
      minCapacity: 'ACU_2',
      maxCapacity: 'ACU_4',
    },
  });

  rds.cdk.cluster.connections.allowDefaultPortFrom(
    net.defaultLambdaSecurityGroup,
    'Allow access from lambda functions'
  );

  app.addDefaultFunctionEnv({
    [envVar('DATABASE')]: defaultDatabaseName,
    [envVar('CLUSTER_ARN')]: rds.clusterArn,
    [envVar('DB_SECRET_ARN')]: rds.secretArn,
  });
  app.addDefaultFunctionPermissions([rds]);

  // DB connection for local dev can be overridden
  const localDatabaseUrl = process.env[envVar('DATABASE_URL')];
  if (process.env.IS_LOCAL_DEV && localDatabaseUrl) {
    app.addDefaultFunctionEnv({
      [envVar('DATABASE_URL')]: localDatabaseUrl,
    });
  }

  return { rds, defaultDatabaseName };
}

/**
 * Generate a database connection string (DSN).
 */
export function makeDatabaseUrl() {
  const prismaConnectionLimit = process.env.PRISMA_CONNECTION_LIMIT || 5;

  const rds = use(Database);
  const cluster = rds.rds.cdk.cluster;
  const dbUsername = cluster.secret?.secretValueFromJson('username');
  const dbPassword = cluster.secret?.secretValueFromJson('password');

  return `postgresql://${dbUsername}:${dbPassword}@${cluster.clusterEndpoint.hostname}/${rds.defaultDatabaseName}?connection_limit=${prismaConnectionLimit}`;
}
