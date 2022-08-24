import { Api } from '@serverless-stack/resources';
import {
  IUserPool,
  OidcAttributeRequestMethod,
  ProviderAttribute,
  UserPoolIdentityProviderOidc,
} from 'aws-cdk-lib/aws-cognito';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Key } from 'aws-cdk-lib/aws-kms';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { secret } from 'common';
import { Construct } from 'constructs';
import { linkedinScope } from './handlers/controller/linkedin';
import {
  ENV_COGNITO_REDIRECT_URI,
  ENV_OIDC_PROVIDER,
  ENV_SECRET_NAME,
  ENV_SIGNING_KEY_ARN,
  OidcProvider,
} from './types';

export interface LinkedInOidcProps {
  userPool: IUserPool;
  secrets: Secret;
  signingKey: Key;
  cognitoDomainName: string;
}

export class LinkedInOidc extends Construct {
  public userPoolIdentityProviderOidc;
  public api;

  constructor(scope: Construct, id: string, { userPool, secrets, signingKey, cognitoDomainName }: LinkedInOidcProps) {
    super(scope, id);

    const clientSecret = secrets.secretValueFromJson(secret('LINKEDIN_CLIENT_SECRET')).toString();
    const clientId = secrets.secretValueFromJson(secret('LINKEDIN_CLIENT_ID')).toString();

    // API for us to do the translation between LinkedIn and Cognito using OIDC
    const api = new Api(scope, 'Api', {
      defaults: {
        function: {
          bundle: { format: 'esm' },
          srcPath: 'stacks/resources/cognitoOidc/handlers',
          permissions: [[secrets, 'grantRead']],
          environment: {
            [ENV_SIGNING_KEY_ARN]: signingKey.keyArn,
            [ENV_SECRET_NAME]: secrets.secretName,
            [ENV_COGNITO_REDIRECT_URI]: `https://${cognitoDomainName}/oauth2/idpresponse`,
            [ENV_OIDC_PROVIDER]: 'LINKEDIN' as OidcProvider,
          },
        },
      },
      routes: {
        'GET /.well-known/openid-configuration': 'handlers.openIdConfiguration',
        'GET /.well-known/jwks.json': 'handlers.jwks',
        'GET /auth/oidc/authorize': 'handlers.authorize',
        'POST /auth/oidc/token': 'handlers.token',
        'GET /auth/oidc/userinfo': 'handlers.userinfo',
      },
    });
    api.attachPermissions([
      new PolicyStatement({
        actions: ['kms:GetPublicKey', 'kms:Sign'],
        effect: Effect.ALLOW,
        resources: [signingKey.keyArn],
      }),
    ]);

    this.api = api;
    const apiUrl = api.url;

    // LinkedIn OIDC auth
    this.userPoolIdentityProviderOidc = new UserPoolIdentityProviderOidc(scope, 'LinkedInOidcProvider', {
      name: 'linkedin',
      scopes: linkedinScope,
      issuerUrl: apiUrl,
      clientId,
      clientSecret,
      userPool,
      attributeMapping: {
        email: ProviderAttribute.other('email'),
        fullname: ProviderAttribute.other('name'),
        profilePicture: ProviderAttribute.other('picture'),
        locale: ProviderAttribute.other('locale'),
        website: ProviderAttribute.other('website'),
        custom: {
          firstNameOriginal: ProviderAttribute.other('firstName'),
          lastNameOriginal: ProviderAttribute.other('lastName'),
          headline: ProviderAttribute.other('headline'),
          vanityName: ProviderAttribute.other('vanityName'),
        },
      },
      attributeRequestMethod: OidcAttributeRequestMethod.GET,
      endpoints: {
        jwksUri: `${apiUrl}/.well-known/jwks.json`,
        authorization: `${apiUrl}/auth/oidc/authorize`,
        token: `${apiUrl}/auth/oidc/token`,
        userInfo: `${apiUrl}/auth/oidc/userinfo`,
      },
    });
  }
}
