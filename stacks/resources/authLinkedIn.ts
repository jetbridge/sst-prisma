import { StackContext } from '@serverless-stack/resources';
import { StringAttribute, UserPoolIdentityProviderOidc, OidcAttributeRequestMethod } from 'aws-cdk-lib/aws-cognito';

export function LinkedInAuth({ stack }: StackContext) {
  // LinkedIn OIDC auth
  const userPoolIdentityProviderOidc = new UserPoolIdentityProviderOidc(stack, 'LinkedInOidc', {
    clientId: 'clientId',
    clientSecret: 'clientSecret',
    issuerUrl: 'issuerUrl',
    userPool: auth.cdk.userPool,

    // the properties below are optional
    attributeMapping: {
      sub: 'id',
      // name: `${userDetails.localizedFirstName} ${userDetails.localizedLastName}`,
      preferred_username: 'vanityName',
      picture: parseImageUrl(pictureElements),
      locale: parseLocale(userDetails.firserDetails.lastName),
      // website: `https://www.linkedin.com/in/${userDetails.vanityName}`,

      // custom attributes:
      // 'custom:headline': userDetails.localizedHeadline,
      'custom:first_name_orig': parseOrigName(userDetails.firstName),
      'custom:last_name_orig': parseOrigName(userDetails.lastName),
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
