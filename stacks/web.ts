import { NextjsSite, StackContext, use } from 'sst/constructs';
import { AppSyncApi } from './appSyncApi';
import { Auth } from './auth';
import { Dns } from './dns';
import { AUTH_SECRET } from './config';

export function Web({ stack, app }: StackContext) {
  const { userPool, webClient, cognitoDomainName } = use(Auth);
  const appSyncApi = use(AppSyncApi);
  const dns = use(Dns);

  // docs: https://docs.serverless-stack.com/constructs/NextjsSite
  const frontendSite = new NextjsSite(stack, 'Web', {
    path: 'web',
    openNextVersion: '3.0.6',
    customDomain: dns.domainName
      ? {
          domainName: dns.domainName,
          domainAlias: 'www.' + dns.domainName,
        }
      : undefined,
    cdk: {
      distribution: {
        comment: `NextJS distribution for ${app.name} (${app.stage})`,
      },
    },
    memorySize: 1024,
    environment: {
      NEXTAUTH_URL: 'http://localhost:3000', // FIXME: how to pass in this URL?
      NEXT_PUBLIC_REGION: stack.region,
      NEXT_PUBLIC_APPSYNC_ENDPOINT: appSyncApi.api.url,
      NEXT_PUBLIC_COGNITO_CLIENT_ID: webClient.userPoolClientId,
      NEXT_PUBLIC_COGNITO_CLIENT_SECRET: webClient.userPoolClientSecret.toString(),
      NEXT_PUBLIC_COGNITO_USER_POOL_ID: userPool.userPoolId,
      NEXT_PUBLIC_COGNITO_DOMAIN_NAME: cognitoDomainName,
      AUTH_SECRET,
    },
  });

  stack.addOutputs({
    WebURL: frontendSite.customDomainUrl || frontendSite.url || 'unknown',
  });
}
