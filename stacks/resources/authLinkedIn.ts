import { StackContext, use } from '@serverless-stack/resources';
import { OidcAttributeRequestMethod, ProviderAttribute, UserPoolIdentityProviderOidc } from 'aws-cdk-lib/aws-cognito';
import { secret } from 'common';
import { Auth } from 'stacks/auth';
import { Secrets } from '../secrets';

export function LinkedInAuth({ stack }: StackContext) {
  const auth = use(Auth).auth;
  const secrets = use(Secrets).secret;

  const clientSecret = secrets.secretValueFromJson(secret('LINKEDIN_CLIENT_ID')).toString();
  const clientId = secrets.secretValueFromJson(secret('LINKEDIN_CLIENT_SECRET')).toString();

  // LinkedIn OIDC auth
  const userPoolIdentityProviderOidc = new UserPoolIdentityProviderOidc(stack, 'LinkedInOidc', {
    clientId,
    clientSecret,
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
