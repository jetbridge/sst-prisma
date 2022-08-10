import { Api } from '@serverless-stack/resources';
import {
  IUserPool,
  OidcAttributeRequestMethod,
  ProviderAttribute,
  StringAttribute,
  UserPoolIdentityProviderOidc,
} from 'aws-cdk-lib/aws-cognito';
import { Key } from 'aws-cdk-lib/aws-kms';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { secret } from 'common';
import { Construct } from 'constructs';
import { dirname } from 'desm';
import { ENV_OIDC_PROVIDER, ENV_SECRET_NAME, ENV_SIGNING_KEY_ARN, OidcProvider } from './types';

export interface LinkedInOidcProps {
  userPool: IUserPool;
  secrets: Secret;
  signingKey: Key;
}

export class LinkedInOidc extends Construct {
  public userPoolIdentityProviderOidc;

  constructor(scope: Construct, id: string, { userPool, secrets, signingKey }: LinkedInOidcProps) {
    super(scope, id);

    // const app = App.of(scope) as App;

    const clientSecret = secrets.secretValueFromJson(secret('LINKEDIN_CLIENT_ID')).toString();
    const clientId = secrets.secretValueFromJson(secret('LINKEDIN_CLIENT_SECRET')).toString();

    // API for us to do the translation between LinkedIn and Cognito using OIDC
    const restApi = new Api(scope, 'Api', {
      defaults: {
        function: {
          srcPath: dirname(import.meta.url),
          permissions: [
            [secrets, 'grantRead'],
            [signingKey, 'grantRead'],
          ],
          environment: {
            [ENV_SIGNING_KEY_ARN]: signingKey.keyArn,
            [ENV_SECRET_NAME]: secrets.secretName,
            [ENV_OIDC_PROVIDER]: 'LINKEDIN' as OidcProvider,
          },
        },
      },
      routes: {
        'GET /.well-known/openid-configuration': 'handlers.openIdConfiguration',
        'GET /.well-known/jwks.json': 'handlers.jwks',
        'GET /auth/oidc/authorize': 'handlers.authorize',
        'GET /auth/oidc/token': 'handlers.token',
        'GET /auth/oidc/userinfo': 'handlers.userinfo',
      },
    });

    const apiUrl = restApi.url;

    // LinkedIn OIDC auth
    this.userPoolIdentityProviderOidc = new UserPoolIdentityProviderOidc(scope, 'LinkedInOidc', {
      clientId,
      clientSecret,
      issuerUrl: 'issuerUrl',
      userPool,

      attributeMapping: {
        email: ProviderAttribute.other('email'),
        fullname: ProviderAttribute.other('name'),
        profilePicture: ProviderAttribute.other('picture'),
        locale: ProviderAttribute.other('locale'),
        website: ProviderAttribute.other('website'),
        custom: {
          firstNameOrig: ProviderAttribute.other('firstName'),
          lastNameOrig: ProviderAttribute.other('lastName'),
        },
      },
      // // the properties below are optional
      // attributeMapping: {
      //   // sub: 'id',
      //   // name: `${userDetails.localizedFirstName} ${userDetails.localizedLastName}`,
      //   email: ProviderAttribute.other('email'),
      //   // preferredUsername: 'vanityName',
      //   // picture: parseImageUrl(pictureElements),
      //   // locale: parseLocale(userDe() => 1ils.firserDetails.lastName),
      //   // website: `https://www.linkedin.com/in/${userDetails.vanityName}`,

      //   // custom attributes:
      //   custom: {
      //     firstNameOrig: ProviderAttribute.other('firstName'),
      //     lastNameOrig: ProviderAttribute.other('lastName'),
      //   },
      // },
      attributeRequestMethod: OidcAttributeRequestMethod.GET,
      endpoints: {
        jwksUri: `${apiUrl}/.well-known/jwks.json`,
        authorization: `${apiUrl}/auth/oidc/authorize`,
        token: `${apiUrl}/auth/oidc/token`,
        userInfo: `${apiUrl}/auth/oidc/userinfo`,
      },
      identifiers: ['identifiers'],
      name: 'name',
      scopes: ['openid', 'r_liteprofile', 'r_emailaddress'],
    });
  }
}
