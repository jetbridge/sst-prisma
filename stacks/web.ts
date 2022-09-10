import { NextjsSite, StackContext, use } from '@serverless-stack/resources';
import { AppSyncApi } from './appSyncApi';
import { Auth } from './auth';
import { Dns } from './dns';
import { Secrets } from './secrets';

export function Web({ stack }: StackContext) {
  const { userPool, webClient, cognitoDomainName } = use(Auth);
  const appSyncApi = use(AppSyncApi);
  const dns = use(Dns);
  const secrets = use(Secrets);

  // docs: https://docs.serverless-stack.com/constructs/NextjsSite
  const frontendSite = new NextjsSite(stack, 'Web', {
    path: 'web',
    customDomain: dns.domainName
      ? {
          domainName: dns.domainName,
          domainAlias: 'www.' + dns.domainName,
        }
      : undefined,
    environment: {
      NEXTAUTH_URL: 'http://localhost:6020', // FIXME: how to pass in this URL?
      NEXTAUTH_SECRET: secrets.secret.secretValueFromJson('RANDOM').toString(), // FIXME https://github.com/nextauthjs/next-auth/discussions/5145 & https://github.com/serverless-stack/sst/issues/1986
      NEXT_PUBLIC_REGION: stack.region,
      NEXT_PUBLIC_APPSYNC_ENDPOINT: appSyncApi.api.url,
      NEXT_PUBLIC_COGNITO_CLIENT_ID: webClient.userPoolClientId,
      NEXT_PUBLIC_COGNITO_USER_POOL_ID: userPool.userPoolId,
      NEXT_PUBLIC_COGNITO_DOMAIN_NAME: cognitoDomainName,
    },
    cdk: {
      distribution: {
        certificate: dns.certificateGlobal,
        ...(dns.domainName && { domainNames: [dns.domainName] }),
      },
    },
  });

  stack.addOutputs({
    WebURL: frontendSite.url,
  });
}
