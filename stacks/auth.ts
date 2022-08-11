import { Auth as SstAuth, StackContext, use } from '@serverless-stack/resources';
import { StringAttribute } from 'aws-cdk-lib/aws-cognito';
import { Key } from 'aws-cdk-lib/aws-kms';
import { AaaaRecord, ARecord, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { UserPoolDomainTarget } from 'aws-cdk-lib/aws-route53-targets';
import { Dns } from './dns';
import { LinkedInOidc } from './resources/cognitoOidc/linkedInOidc';
import { Secrets } from './secrets';

export function Auth({ stack, app }: StackContext) {
  const dns = use(Dns);

  const signingKey = new Key(stack, 'SigningKey', {
    alias: app.logicalPrefixedName('signingkey'),
    description: 'Signing key for JWT',
  });

  const auth = new SstAuth(stack, 'Auth', {
    identityPoolFederation: {
      // plug in auth providers here
      // https://docs.sst.dev/constructs/Auth#authcognitoidentitypoolfederationprops
    },
    triggers: {
      // save user in DB
      preSignUp: 'backend/src/auth/trigger/preSignUp.handler',
    },
    cdk: {
      userPool: {
        customAttributes: {
          first_name_orig: new StringAttribute({ mutable: true }),
          last_name_orig: new StringAttribute({ mutable: true }),
        },
      },
    },
  });
  const userPool = auth.cdk.userPool;

  // custom domain
  const domainName = dns.domainName;
  if (dns.hostedZone && dns.certificateGlobal && domainName) {
    const domain = userPool.addDomain('CustomDomain', {
      customDomain: {
        domainName,
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

  new LinkedInOidc(stack, 'LinkedInOidc', {
    secrets: use(Secrets).secret,
    signingKey,
    userPool,
    cognitoDomain: cognitoDomainName,
  });

  return { auth, userPool: auth.cdk.userPool, domainName };
}
