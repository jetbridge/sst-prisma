import * as sst from '@serverless-stack/resources';
import { SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { APP_NAME } from '.';
import { ENV_VARS } from '../src/env';
import { APP_SECRETS } from '../src/secrets';
import { GraphqlApi } from './resources/graphqlApi';
import { Layers } from './resources/layers';
import { DbMigrationScript } from './resources/migrationScript';
import { Rds } from './resources/rds';
import { RestApi } from './resources/restApi';
import Secret from './resources/secret';

export const RUNTIME = Runtime.NODEJS_16_X;

export default class MainStack extends sst.Stack {
  constructor(scope: sst.App, id: string, props?: sst.StackProps) {
    super(scope, id, props);

    // VPC
    const vpc = new Vpc(this, `${APP_NAME}-vpc`, { natGateways: 1 });
    const defaultLambdaSecurityGroup = new SecurityGroup(this, 'DefaultLambda', {
      vpc,
      description: 'Default security group for lambda functions',
    });
    this.setDefaultFunctionProps({
      vpc,
      runtime: 'nodejs16.x',
      securityGroups: [defaultLambdaSecurityGroup],
      environment: {
        [ENV_VARS.STAGE]: scope.stage,
      },
      bundle: {
        format: 'esm',
      },
    });

    // Layers
    new Layers(this, 'Layers');

    // Postgres DB
    const rds = new Rds(this, 'Rds', { vpc });
    rds.cdk.cluster.connections.allowDefaultPortFrom(defaultLambdaSecurityGroup, 'Allow access from lambda functions');

    // Secrets
    new Secret(this, 'AppSecret', {
      secrets: {
        // DB URL in secrets
        [APP_SECRETS.DATABASE_URL]: rds.makeDatabaseUrl(),
      },
    });

    // REST API
    const restApi = new RestApi(this, 'RestApi');

    // AppSync API
    new GraphqlApi(this, 'Gql');

    // DB migrations
    new DbMigrationScript(this, 'MigrationScript', { vpc });

    this.addOutputs({
      RestApiEndpoint: restApi.url,
    });
  }
}
