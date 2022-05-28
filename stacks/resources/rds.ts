import { envVar } from '@common/env';
import { RDS, Stack } from '@serverless-stack/resources';
import { Duration } from 'aws-cdk-lib';
import { IVpc } from 'aws-cdk-lib/aws-ec2';
import { APP_NAME } from '..';
import { IS_PRODUCTION } from '../config';

interface RdsProps {
  vpc: IVpc;
}

const DATABASE = APP_NAME;

const prismaConnectionLimit = 10;

export class Rds extends RDS {
  constructor(scope: Stack, id: string, { vpc }: RdsProps) {
    super(scope, id, {
      cdk: { cluster: { vpc } },
      engine: 'postgresql10.14',
      defaultDatabaseName: APP_NAME,
      scaling: {
        autoPause: IS_PRODUCTION ? false : Duration.hours(10).toMinutes(),
        minCapacity: 'ACU_2',
        maxCapacity: 'ACU_4',
      },
    });

    scope.addDefaultFunctionEnv({
      [envVar('DATABASE')]: DATABASE,
      [envVar('CLUSTER_ARN')]: this.clusterArn,
      [envVar('DB_SECRET_ARN')]: this.secretArn,
    });
    scope.addDefaultFunctionPermissions([this]);

    // DB connection for local dev
    if (process.env.IS_LOCAL_DEV && process.env.DATABASE_URL) {
      scope.addDefaultFunctionEnv({
        [envVar('DATABASE_URL')]: process.env.DATABASE_URL,
      });
    }
  }

  makeDatabaseUrl() {
    return makeDatabaseUrl(this);
  }
}

/**
 * Generate a database connection string (DSN).
 */
function makeDatabaseUrl(db: Rds) {
  const dbUsername = db.cdk.cluster.secret?.secretValueFromJson('username');
  const dbPassword = db.cdk.cluster.secret?.secretValueFromJson('password');

  return `postgresql://${dbUsername}:${dbPassword}@${db.clusterEndpoint.hostname}/${APP_NAME}?connection_limit=${prismaConnectionLimit}`;
}
