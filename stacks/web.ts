import { NextjsSite, StackContext, use } from 'sst/constructs';
import { AppSyncApi } from './appSyncApi';
import { Auth } from './auth';
import { Dns } from './dns';
import { WEB_URL } from './config';
import { Secrets } from './secrets';

export function Web({ stack, app }: StackContext) {
  const { userPool, webClient, cognitoDomainName } = use(Auth);
  const appSyncApi = use(AppSyncApi);
  const dns = use(Dns);
  const { secret } = use(Secrets);
  const isLocal = app.local;

  if (!isLocal && !WEB_URL) {
    console.warn(`Please set WEB_URL in .env.${app.stage} to the URL of your frontend site.`);
  }

  // docs: https://docs.serverless-stack.com/constructs/NextjsSite
  const frontendSite = new NextjsSite(stack, 'Web', {
    path: 'web',
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
      NEXTAUTH_SECRET: secret.secretValueFromJson('RANDOM').toString(),
      NEXTAUTH_URL: isLocal ? 'http://localhost:6001' : WEB_URL ?? 'https://set-me-in-.env',

      NEXT_PUBLIC_REGION: stack.region,
      NEXT_PUBLIC_APPSYNC_ENDPOINT: appSyncApi.api.url,
      NEXT_PUBLIC_COGNITO_CLIENT_ID: webClient.userPoolClientId,
      NEXT_PUBLIC_COGNITO_USER_POOL_ID: userPool.userPoolId,
      NEXT_PUBLIC_COGNITO_DOMAIN_NAME: cognitoDomainName,
    },
  });

  stack.addOutputs({
    WebURL: frontendSite.customDomainUrl || frontendSite.url || 'unknown',
  });
}
