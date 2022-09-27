import { StackContext } from '@serverless-stack/resources';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;

export function Secrets({ stack, app }: StackContext) {
  if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET) {
    throw new Error('You need to define LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET in your environment variables');
  }

  const secret = new Secret(stack, 'Secret', {
    description: app.logicalPrefixedName('app'),
    generateSecretString: {
      secretStringTemplate: JSON.stringify({
        // optional
        ['LINKEDIN_CLIENT_ID']: LINKEDIN_CLIENT_ID,
        ['LINKEDIN_CLIENT_SECRET']: LINKEDIN_CLIENT_SECRET,
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

