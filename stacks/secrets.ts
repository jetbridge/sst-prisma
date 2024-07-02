import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { StackContext } from 'sst/constructs';

export function Secrets({ stack }: StackContext) {
  const secret = new Secret(stack, 'Secret', {
    generateSecretString: {
      secretStringTemplate: JSON.stringify({}),
      generateStringKey: 'RANDOM',
    },
  });

  return { secret };
}
