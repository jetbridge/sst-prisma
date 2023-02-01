import { StackContext } from 'sst/constructs';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';

export function Secrets({ stack, app }: StackContext) {
  const secret = new Secret(stack, 'Secret', {
    description: app.logicalPrefixedName('app'),
    generateSecretString: {
      secretStringTemplate: JSON.stringify({}),
      generateStringKey: 'RANDOM',
      excludePunctuation: true,
    },
  });

  app.addDefaultFunctionEnv({
    ['APP_SECRET_ARN']: secret.secretArn,
  });
  app.addDefaultFunctionPermissions([[secret, 'grantRead']]);

  return { secret };
}
