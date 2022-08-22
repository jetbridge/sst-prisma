import { StackContext } from '@serverless-stack/resources';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';

export function Secrets({ stack, app }: StackContext) {
  const secret = new Secret(stack, 'Secret', {
    description: app.logicalPrefixedName('app'),
    generateSecretString: {
      secretStringTemplate: JSON.stringify({
        // optional
        ['LINKEDIN_CLIENT_ID']: 'changeme',
        ['LINKEDIN_CLIENT_SECRET']: 'changeme',
      }),
      generateStringKey: 'RANDOM', // unused
    },
  });

  app.addDefaultFunctionEnv({
    ['APP_SECRET_ARN']: secret.secretArn,
  });
  app.addDefaultFunctionPermissions([[secret, 'grantRead']]);

  return { secret };
}
