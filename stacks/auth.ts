import { Cognito, StackContext, use } from 'sst/constructs'
import { Duration } from 'aws-cdk-lib'
import { StringAttribute, UserPoolClientIdentityProvider } from 'aws-cdk-lib/aws-cognito'
import { AaaaRecord, ARecord, RecordTarget } from 'aws-cdk-lib/aws-route53'
import { UserPoolDomainTarget } from 'aws-cdk-lib/aws-route53-targets'
import { Dns } from './dns'
import { WEB_DOMAIN } from './config'
import { HttpUserPoolAuthorizer } from 'aws-cdk-lib/aws-apigatewayv2-authorizers'

const ALLOWED_HOSTS = [
  'http://localhost:6001',
  ...(WEB_DOMAIN ? [`https://${WEB_DOMAIN}`] : []),
  /// ... add frontend hosts here
]
const ALLOWED_URLS = ['/login', '/api/auth/callback/cognito']

export function Auth({ stack, app }: StackContext) {
  const { certificateGlobal, domainName, hostedZone } = use(Dns)

  const callbackUrls = ALLOWED_HOSTS.flatMap((h) => ALLOWED_URLS.map((url) => h + url))

  const auth = new Cognito(stack, 'Auth', {
    triggers: {
      // save user in DB
      preSignUp: {
        handler: 'backend/src/auth/trigger/preSignUp.handler',
      },
    },
    login: ['email'],
    cdk: {
      userPoolClient: {},
      userPool: {
        // what users can sign in with
        // ⚠️ The Cognito service prevents changing the signInAlias property for an existing user pool.
        signInAliases: { email: true, phone: false },
        // allow users to verify their email themselves
        autoVerify: { email: true, phone: false },
        selfSignUpEnabled: true,
        customAttributes: {
          firstNameOriginal: new StringAttribute({ mutable: true }),
          lastNameOriginal: new StringAttribute({ mutable: true }),
          headline: new StringAttribute({ mutable: true }),
          vanityName: new StringAttribute({ mutable: true }),
        },
      },
    },
  })

  const userPool = auth.cdk.userPool

  let cognitoDomainName
  // custom domain
  if (hostedZone && certificateGlobal && domainName) {
    cognitoDomainName = `${app.stage}-auth.${domainName}`
    const customDomain = userPool.addDomain('CustomDomain', {
      customDomain: {
        domainName: cognitoDomainName,
        certificate: certificateGlobal,
      },
    })
    new ARecord(stack, 'Domain4', {
      zone: hostedZone,
      target: RecordTarget.fromAlias(new UserPoolDomainTarget(customDomain)),
      recordName: cognitoDomainName,
    })
    new AaaaRecord(stack, 'Domain6', {
      zone: hostedZone,
      target: RecordTarget.fromAlias(new UserPoolDomainTarget(customDomain)),
      recordName: cognitoDomainName,
    })
  } else {
    // default auth domain
    // must be set for cognito to work at all unless a custom domain is specified
    // must be globally unique
    // feel free to edit this
    const resourcePrefix = `auth-${app.name}-${app.stage}`
    const cognitoDomain = userPool.addDomain('CognitoDomain', {
      cognitoDomain: { domainPrefix: resourcePrefix },
    })
    const cognitoBaseUrl = cognitoDomain.baseUrl().replace('https://', '')
    cognitoDomainName = cognitoBaseUrl
  }

  // create cognito client
  const webClient = userPool.addClient('WebClient', {
    supportedIdentityProviders: [UserPoolClientIdentityProvider.COGNITO],
    refreshTokenValidity: Duration.days(365),
    oAuth: {
      callbackUrls: callbackUrls,
      logoutUrls: callbackUrls,
    },
  })
  const httpApiAuthorizer = new HttpUserPoolAuthorizer('HttpUserPoolAuthorizer', userPool, {
    userPoolClients: [webClient],
  })
  stack.addOutputs({ UserPoolId: userPool.userPoolId, WebClientId: webClient.userPoolClientId })

  return {
    userPool,
    domainName,
    webClient,
    cognitoDomainName,
    httpApiAuthorizer,
  }
}
