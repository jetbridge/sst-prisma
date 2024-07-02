import { Secret } from 'aws-cdk-lib/aws-secretsmanager'
import { Config, StackContext, use } from 'sst/constructs'
import { Iam } from './iam'

export function Secrets({ stack }: StackContext) {
  const secretsArn = process.env.SECRETS_ARN

  // needed for NEXTAUTH_SECRET env var since there is no way to provide it via SST Config
  let secrets
  if (secretsArn) {
    // import
    secrets = Secret.fromSecretCompleteArn(stack, 'Secrets', secretsArn)
  } else {
    secrets = secretsArn
      ? Secret.fromSecretCompleteArn(stack, 'Secrets', secretsArn)
      : new Secret(stack, 'App', {
          description: `${stack.stackName} ${stack.stage} secrets`,
          // secret default template
          generateSecretString: {
            secretStringTemplate: JSON.stringify({ RANDOM: 'AUTH_SECRET' }),
            generateStringKey: 'AUTH_SECRET',
            excludePunctuation: true,
          },
        })
  }

  // add more SST secrets here
  const SECRET_1 = new Config.Secret(stack, 'SECRET_1')

  return { secrets, SECRET_1 }
}
