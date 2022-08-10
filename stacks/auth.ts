import { Auth as SstAuth, StackContext, use } from '@serverless-stack/resources';
import { StringAttribute } from 'aws-cdk-lib/aws-cognito';
import { Key } from 'aws-cdk-lib/aws-kms';
import { LinkedInOidc } from './resources/cognitoOidc/linkedInOidc';
import { Secrets } from './secrets';

export function Auth({ stack, app }: StackContext) {
  const signingKey = new Key(stack, 'SigningKey', {
    alias: app.logicalPrefixedName('signingkey'),
    description: 'Signing key for JWT',
  });

  const auth = new SstAuth(stack, 'Auth', {
    identityPoolFederation: {
      // plug in auth providers here
      // https://docs.sst.dev/constructs/Auth#authcognitoidentitypoolfederationprops
    },
    triggers: {
      // save user in DB
      preSignUp: 'backend/src/auth/trigger/preSignUp.handler',
    },
    cdk: {
      userPool: {
        customAttributes: {
          first_name_orig: new StringAttribute({ mutable: true }),
          last_name_orig: new StringAttribute({ mutable: true }),
        },
      },
    },
  });

  new LinkedInOidc(stack, 'LinkedInOidc', {
    secrets: use(Secrets).secret,
    signingKey,
    userPool: auth.cdk.userPool,
  });

  return { auth, userPool: auth.cdk.userPool };
}
