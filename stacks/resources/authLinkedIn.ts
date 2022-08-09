import { StackContext, use } from '@serverless-stack/resources';
import { OidcAttributeRequestMethod, ProviderAttribute, UserPoolIdentityProviderOidc } from 'aws-cdk-lib/aws-cognito';
import { Auth } from './auth';

export function LinkedInAuth({ stack }: StackContext) {
  const auth = use(Auth).auth;

  // LinkedIn OIDC auth
  const userPoolIdentityProviderOidc = new UserPoolIdentityProviderOidc(stack, 'LinkedInOidc', {
    clientId: 'clientId',
    clientSecret: 'clientSecret',
    issuerUrl: 'issuerUrl',
    userPool: auth.cdk.userPool,

    // the properties below are optional
    attributeMapping: {
      // sub: 'id',
      // name: `${userDetails.localizedFirstName} ${userDetails.localizedLastName}`,
      email: ProviderAttribute.other('email'),
      // preferredUsername: 'vanityName',
      // picture: parseImageUrl(pictureElements),
      // locale: parseLocale(userDe() => 1ils.firserDetails.lastName),
      // website: `https://www.linkedin.com/in/${userDetails.vanityName}`,

      // custom attributes:
      custom: {
        firstNameOrig: ProviderAttribute.other('firstName'),
        lastNameOrig: ProviderAttribute.other('lastName'),
      },
    },
    attributeRequestMethod: OidcAttributeRequestMethod.GET,
    endpoints: {
      authorization: '/oauth/v2/authorization',
      jwksUri: 'jwksUri',
      token: '/oauth/v2/accessToken',
      userInfo:
        '/v2/me?projection=(id,localizedFirstName,localizedLastName,profilePicture(displayImage~digitalmediaAsset:playableStreams),firstName,lastName',
    },
    identifiers: ['identifiers'],
    name: 'name',
    scopes: ['scopes'],
  });
}
