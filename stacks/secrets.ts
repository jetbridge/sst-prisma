import { Config, StackContext } from '@serverless-stack/resources';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { makeDatabaseUrl } from './database';

export function Secrets({ stack, app }: StackContext) {
  const secret = new Secret(stack, 'Secret', {
    description: app.logicalPrefixedName('app'),
    generateSecretString: {
      secretStringTemplate: JSON.stringify({
        // DB connection info
        DATABASE_URL: makeDatabaseUrl(),
      }),
      generateStringKey: 'APP',
    },
  });

  const appSecretArn = new Config.Parameter(stack, 'APP_SECRET_ARN', { value: secret.secretArn });
  app.addDefaultFunctionPermissions([[secret, 'grantRead']]);
  app.setDefaultFunctionProps({ config: [appSecretArn] });

  return { secret };
}
