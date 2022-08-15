import { StackContext, NextjsSite, use } from '@serverless-stack/resources';
import { AppSyncApi } from './appSyncApi';

export function Web({ stack }: StackContext) {
  const appSyncApi = use(AppSyncApi);

  // Web
  // docs: https://docs.serverless-stack.com/constructs/NextjsSite
  const frontendSite = new NextjsSite(stack, 'Web', {
    path: 'web',
    environment: {
      NEXT_PUBLIC_REGION: stack.region,
      NEXT_PUBLIC_APPSYNC_ENDPOINT: appSyncApi.api.url,
    },
  });

  stack.addOutputs({
    WebURL: frontendSite.url,
  });
}
