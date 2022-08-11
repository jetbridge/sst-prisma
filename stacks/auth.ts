import { StackContext, use } from '@serverless-stack/resources';
import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import { StringAttribute, UserPool, UserPoolClientIdentityProvider } from 'aws-cdk-lib/aws-cognito';
import { Key, KeySpec, KeyUsage } from 'aws-cdk-lib/aws-kms';
import { AaaaRecord, ARecord, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { UserPoolDomainTarget } from 'aws-cdk-lib/aws-route53-targets';
import { Dns } from './dns';
import { LinkedInOidc } from './resources/cognitoOidc/linkedInOidc';
import { Secrets } from './secrets';

export function Auth({ stack, app }: StackContext) {
  const dns = use(Dns);

  const signingKey = new Key(stack, 'SigningKey', {
    // alias: app.logicalPrefixedName('signingkey'),
    description: 'Signing key for OIDC',
    keyUsage: KeyUsage.SIGN_VERIFY,
    keySpec: KeySpec.RSA_2048,
    removalPolicy: RemovalPolicy.DESTROY,
  });

  const hosts = [
    'http://localhost:6020',
    /// ... add frontend hosts here
  ];
  const allowedUrls = ['/login', '/api/auth/callback/cognito'];
  const callbackUrls = hosts.flatMap((h) => allowedUrls.map((url) => h + url));

  // const auth = new SstAuth(stack, 'Auth', {
  //   identityPoolFederation: {
  //     cdk:{cfnIdentityPool:{}}
  //     // plug in auth providers here
  //     // https://docs.sst.dev/constructs/Auth#authcognitoidentitypoolfederationprops
  //   },
  //   triggers: {
  //     // save user in DB
  //     preSignUp: 'backend/src/auth/trigger/preSignUp.handler',
  //   },
  //   cdk: {
  //     userPoolClient: {},
  //     userPool: {
  //       selfSignUpEnabled: false,
  //       customAttributes: {
  //         firstNameOriginal: new StringAttribute({ mutable: true }),
  //         lastNameOriginal: new StringAttribute({ mutable: true }),
  //         headline: new StringAttribute({ mutable: true }),
  //         vanityName: new StringAttribute({ mutable: true }),
  //       },
  //     },
  //   },
  // });
  // const userPool = auth.cdk.userPool;

  const userPool = new UserPool(stack, 'UserPool', {
    selfSignUpEnabled: false,

    // what users can sign in with
    // ⚠️ The Cognito service prevents changing the signInAlias property for an existing user pool.
    signInAliases: { email: true, phone: false },
    // allow users to verify their email themselves
    autoVerify: { email: true, phone: false },

    userPoolName: app.logicalPrefixedName('auth'),
    customAttributes: {
      firstNameOriginal: new StringAttribute({ mutable: true }),
      lastNameOriginal: new StringAttribute({ mutable: true }),
      headline: new StringAttribute({ mutable: true }),
      vanityName: new StringAttribute({ mutable: true }),
    },
    lambdaTriggers: {
      // ....
    },
  });

  // custom domain
  const domainName = dns.domainName;
  if (dns.hostedZone && dns.certificateGlobal && domainName) {
    const domain = userPool.addDomain('CustomDomain', {
      customDomain: {
        domainName: 'auth.' + domainName,
        certificate: dns.certificateGlobal,
      },
    });
    new ARecord(stack, 'Domain4', {
      zone: dns.hostedZone,
      target: RecordTarget.fromAlias(new UserPoolDomainTarget(domain)),
      recordName: domainName,
    });
    new AaaaRecord(stack, 'Domain6', {
      zone: dns.hostedZone,
      target: RecordTarget.fromAlias(new UserPoolDomainTarget(domain)),
      recordName: domainName,
    });
  }

  // get cognito domain
  const cognitoDomain = userPool.addDomain('CognitoDomain', {
    cognitoDomain: { domainPrefix: `${app.name}-${app.stage}` },
  });
  const cognitoBaseUrl = cognitoDomain.baseUrl().replace('https://', '');
  const cognitoDomainName = dns.hostedZone ? `${app.stage}-auth.${dns.hostedZone.zoneName}` : cognitoBaseUrl;

  // create LinkedIn provider
  const linkedIn = new LinkedInOidc(stack, 'LinkedInOidc', {
    secrets: use(Secrets).secret,
    signingKey: signingKey,
    userPool,
    cognitoDomainName,
  });

  // create cognito client
  const webClient = userPool.addClient('WebClient', {
    supportedIdentityProviders: [
      UserPoolClientIdentityProvider.COGNITO,
      UserPoolClientIdentityProvider.custom(linkedIn.userPoolIdentityProviderOidc.providerName),
    ],
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
    linkedInIssuer: linkedIn.api.url,
    cognitoDomainName,
  };
}
