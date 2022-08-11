import { StackContext, NextjsSite, use } from '@serverless-stack/resources';
import { AppSyncApi } from './appSyncApi';
import { Auth } from './auth';

export function Web({ stack }: StackContext) {
  const { userPool, clientId } = use(Auth);
  const appSyncApi = use(AppSyncApi);

  // Web
  // docs: https://docs.serverless-stack.com/constructs/NextjsSite
  const frontendSite = new NextjsSite(stack, 'Web', {
    path: 'web',
    environment: {
      NEXT_PUBLIC_REGION: stack.region,
      NEXT_PUBLIC_APPSYNC_ENDPOINT: appSyncApi.api.url,
      NEXT_PUBLIC_COGNITO_CLIENT_ID: clientId,
      NEXT_PUBLIC_COGNITO_USER_POOL_ID: userPool.userPoolId,
    },
  });

  stack.addOutputs({
    WebURL: frontendSite.url,
  });
}
