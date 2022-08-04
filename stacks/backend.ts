import { APP_NAME, envVar, secret } from 'common';
import { SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { GraphqlApi } from './resources/graphqlApi';
import { Layers } from './resources/layers';
import { DbMigrationScript } from './resources/migrationScript';
import { Rds } from './resources/rds';
import { RestApi } from './resources/restApi';
import Secret from './resources/secret';
import { StackContext } from '@serverless-stack/resources';

export const RUNTIME = Runtime.NODEJS_16_X;

export function Backend({ stack }: StackContext) {
  // VPC
  const vpc = new Vpc(stack, `${APP_NAME}-vpc`, { natGateways: 1 });
  const defaultLambdaSecurityGroup = new SecurityGroup(stack, 'DefaultLambda', {
    vpc,
    description: 'Default security group for lambda functions',
  });
  stack.setDefaultFunctionProps({
    vpc,
    runtime: 'nodejs16.x',
    securityGroups: [defaultLambdaSecurityGroup],
    environment: {
      [envVar('STAGE')]: stack.stage,
    },
    bundle: {
      format: 'esm',
    },
  });

  // Layers
  new Layers(stack, 'Layers');

  // Postgres DB
  const rds = new Rds(stack, 'Rds', { vpc });
  rds.cdk.cluster.connections.allowDefaultPortFrom(defaultLambdaSecurityGroup, 'Allow access from lambda functions');

  // Secrets
  new Secret(stack, 'AppSecret', {
    secrets: {
      // DB URL in secrets
      [secret('DATABASE_URL')]: rds.makeDatabaseUrl(),
    },
  });

  // REST API
  const restApi = new RestApi(stack, 'RestApi');

  // AppSync API
  new GraphqlApi(stack, 'Gql');

  // DB migrations
  new DbMigrationScript(stack, 'MigrationScript', { vpc });

  stack.addOutputs({
    RestApiEndpoint: restApi.url,
  });
}
