import { NextjsSite, StackContext, use } from 'sst/constructs'
import { AppSyncApi } from './appSyncApi'
import { Auth } from './auth'
import { Dns } from './dns'
import { IS_PRODUCTION, WEB_DOMAIN } from './config'
import { Secrets } from './secrets'

export function Web({ stack, app }: StackContext) {
  const { userPool, webClient, cognitoDomainName } = use(Auth)
  const { secrets, ...configSecrets } = use(Secrets)
  const appSyncApi = use(AppSyncApi)
  const dns = use(Dns)
  const isLocal = app.local

  if (!isLocal && !process.env.SST_STAGE && !WEB_DOMAIN) {
    console.warn(`Please set WEB_DOMAIN in .env.${app.stage} to the hostname of your frontend site.`)
  }

  const allSecrets = Object.values(configSecrets)

  // docs: https://docs.serverless-stack.com/constructs/NextjsSite
  const nextjsApp = new NextjsSite(stack, 'Web', {
    path: 'web',
    openNextVersion: '3.0.6',
    bind: [...allSecrets],
    runtime: 'nodejs20.x',
    warm: IS_PRODUCTION ? 6 : 0,
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
    memorySize: 1536,
    environment: {
      NEXTAUTH_SECRET: secrets.secretValueFromJson('AUTH_SECRET').toString(),
      NEXTAUTH_URL: isLocal ? 'http://localhost:6001' : WEB_DOMAIN ? `https://${WEB_DOMAIN}` : 'https://set-me-in-.env',

      NEXT_PUBLIC_REGION: stack.region,
      NEXT_PUBLIC_APPSYNC_ENDPOINT: appSyncApi.api.url,
      NEXT_PUBLIC_COGNITO_CLIENT_ID: webClient.userPoolClientId,
      NEXT_PUBLIC_COGNITO_USER_POOL_ID: userPool.userPoolId,
      NEXT_PUBLIC_COGNITO_DOMAIN_NAME: cognitoDomainName || '',
    },
  })

  let webDomain = nextjsApp.customDomainUrl || nextjsApp.url || 'unknown'
  webDomain = webDomain.replace('https://', '').replace('http://', '')

  stack.addOutputs({
    WebUrl: nextjsApp.customDomainUrl || nextjsApp.url || 'unknown',
    WebDomain: webDomain,
  })
}
