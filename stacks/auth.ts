import { Cognito, StackContext, use } from 'sst/constructs';
import { Duration } from 'aws-cdk-lib';
import { StringAttribute, UserPoolClientIdentityProvider } from 'aws-cdk-lib/aws-cognito';
import { AaaaRecord, ARecord, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { UserPoolDomainTarget } from 'aws-cdk-lib/aws-route53-targets';
import { Dns } from './dns';

const ALLOWED_HOSTS = [
  'http://localhost:6020',
  /// ... add frontend hosts here
];
const ALLOWED_URLS = ['/login', '/api/auth/callback/cognito'];

export function Auth({ stack, app }: StackContext) {
  const dns = use(Dns);

  const callbackUrls = ALLOWED_HOSTS.flatMap((h) => ALLOWED_URLS.map((url) => h + url));

  const auth = new Cognito(stack, 'Auth', {
    triggers: {
      // save user in DB
      preSignUp: 'backend/src/auth/trigger/preSignUp.handler',
    },
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
  });
  const userPool = auth.cdk.userPool;

  // custom domain
  const domainName = dns.domainName;
  if (dns.hostedZone && dns.certificateGlobal && domainName) {
    const authDomain = 'auth.' + domainName;
    const domain = userPool.addDomain('CustomDomain', {
      customDomain: {
        domainName: authDomain,
        certificate: dns.certificateGlobal,
      },
    });
    new ARecord(stack, 'Domain4', {
      zone: dns.hostedZone,
      target: RecordTarget.fromAlias(new UserPoolDomainTarget(domain)),
      recordName: authDomain,
    });
    new AaaaRecord(stack, 'Domain6', {
      zone: dns.hostedZone,
      target: RecordTarget.fromAlias(new UserPoolDomainTarget(domain)),
      recordName: authDomain,
    });
  }

  // get cognito domain
  const cognitoDomain = userPool.addDomain('CognitoDomain', {
    cognitoDomain: { domainPrefix: `${app.name}-${app.stage}` },
  });
  const cognitoBaseUrl = cognitoDomain.baseUrl().replace('https://', '');
  const cognitoDomainName = dns.hostedZone ? `${app.stage}-auth.${dns.hostedZone.zoneName}` : cognitoBaseUrl;

  // create cognito client
  const webClient = userPool.addClient('WebClient', {
    supportedIdentityProviders: [UserPoolClientIdentityProvider.COGNITO],
    refreshTokenValidity: Duration.days(365),
    oAuth: {
      callbackUrls: callbackUrls,
      logoutUrls: callbackUrls,
    },
  });

  return {
    userPool,
    domainName,
    webClient,
    cognitoDomainName,
  };
}
