import { Auth as SstAuth, StackContext } from '@serverless-stack/resources';
import { StringAttribute } from 'aws-cdk-lib/aws-cognito';

export function Auth({ stack }: StackContext) {
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

  return { auth, userPool: auth.cdk.userPool };
}
