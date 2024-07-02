import { NextjsSite, StackContext, use } from 'sst/constructs';
import { AppSyncApi } from './appSyncApi';
import { Auth } from './auth';
import { Dns } from './dns';
import { Secrets } from './secrets';

export function Web({ stack, app }: StackContext) {
  const { userPool, webClient, cognitoDomainName } = use(Auth);
  const { secrets, ...configSecrets } = use(Secrets);
  const appSyncApi = use(AppSyncApi);
  const dns = use(Dns);

  const allSecrets = Object.values(configSecrets);

  // docs: https://docs.serverless-stack.com/constructs/NextjsSite
  const frontendSite = new NextjsSite(stack, 'Web', {
    path: 'web',
    openNextVersion: '3.0.6',
    bind: [...allSecrets],
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
      NEXT_PUBLIC_COGNITO_USER_POOL_ID: userPool.userPoolId,
      NEXT_PUBLIC_COGNITO_DOMAIN_NAME: cognitoDomainName,
      NEXTAUTH_SECRET: secrets.secretValueFromJson('NEXTAUTH_SECRET').toString(),
    },
  });

  stack.addOutputs({
    WebURL: frontendSite.customDomainUrl || frontendSite.url || 'unknown',
  });
}
