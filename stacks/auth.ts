import { Auth as SstAuth, StackContext } from '@serverless-stack/resources';

export function Auth({ stack }: StackContext) {
  const auth = new SstAuth(stack, 'Auth', {
    defaults: {
      function: {},
    },
    triggers: {
      preSignUp: 'backend/src/auth/trigger/preSignUp.handler',
    },
  });

  return { auth };
}
