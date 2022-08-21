import { Api, Config } from '@serverless-stack/resources';
import {
  IUserPool,
  OidcAttributeRequestMethod,
  ProviderAttribute,
  UserPoolIdentityProviderOidc,
} from 'aws-cdk-lib/aws-cognito';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Key } from 'aws-cdk-lib/aws-kms';
import { Construct } from 'constructs';
import { OidcProvider } from './types';

export interface LinkedInOidcProps {
  userPool: IUserPool;
  signingKey: Key;
  cognitoDomainName: string;
}

export class LinkedInOidc extends Construct {
  public userPoolIdentityProviderOidc;
  public api;

  constructor(scope: Construct, id: string, { userPool, signingKey, cognitoDomainName }: LinkedInOidcProps) {
    super(scope, id);

    const clientId = new Config.Secret(this, 'LINKEDIN_CLIENT_ID');
    const clientSecret = new Config.Secret(this, 'LINKEDIN_CLIENT_SECRET');
    const signingKeyArn = new Config.Parameter(this, 'SIGNING_KEY_ARN', { value: signingKey.keyArn });
    const oidcProvider = new Config.Parameter(this, 'OIDC_PROVIDER', { value: 'LINKEDIN' as OidcProvider });
    const cognitoRedirectUri = new Config.Parameter(this, 'COGNITO_REDIRECT_URI', {
      value: `https://${cognitoDomainName}/oauth2/idpresponse`,
    });

    // API for us to do the translation between LinkedIn and Cognito using OIDC
    const api = new Api(scope, 'Api', {
      defaults: {
        function: {
          bundle: { format: 'esm' },
          srcPath: 'stacks/resources/cognitoOidc/handlers',
          config: [clientId, clientSecret, signingKeyArn, cognitoRedirectUri, oidcProvider],
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
      scopes: ['openid', 'r_liteprofile', 'r_emailaddress'],
      issuerUrl: apiUrl,
      clientId: clientId.toString(),
      clientSecret: clientSecret.toString(),
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
