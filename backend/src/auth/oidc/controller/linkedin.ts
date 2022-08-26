/* eslint-disable @typescript-eslint/no-explicit-any */
import { got } from 'got';
import { URLSearchParams } from 'url';
import { ENV_COGNITO_REDIRECT_URI } from '../types';
import { makeIdToken } from '../crypto';
import { filterOutScopesForLinkedin } from '../util';
import * as req from './requests';

// `openid` is an scope required by Cognito
// but Linkedin throws an error if this scope is passed as it is not recognized
// so it needs to be filtered out in the getAuthorizeUrl function
export const linkedinScope = ['openid', 'r_liteprofile', 'r_emailaddress'];

const linkedinApiUrl = 'https://api.linkedin.com';
const linkedinLoginUrl = 'https://linkedin.com';

interface UserDetails {
  id: string;
  firstName?: string;
  lastName?: string;
  localizedFirstName?: string;
  localizedLastName?: string;
  profilePicture?: any; // https://docs.microsoft.com/en-us/linkedin/shared/references/v2/profile/profile-picture
  localizedHeadline?: string;
  vanityName?: string;
}

const getApiEndpoints = (apiBaseUrl: string, loginBaseUrl: string) => {
  return {
    // explained here:
    // https://docs.microsoft.com/en-us/linkedin/shared/api-guide/concepts/projections?view=li-lms-2022-08
    // https://docs.microsoft.com/en-us/linkedin/shared/references/v2/profile/lite-profile
    userDetails: `${apiBaseUrl}/v2/me?projection=(id,vanityName,localizedFirstName,localizedLastName,profilePicture(displayImage~digitalmediaAsset:playableStreams),firstName,lastName)`,
    userEmails: `${apiBaseUrl}/v2/clientAwareMemberHandles?q=members&projection=(elements*(primary,type,handle~))`,
    oauthToken: `${loginBaseUrl}/oauth/v2/accessToken`,
    oauthAuthorize: `${loginBaseUrl}/oauth/v2/authorization`,
  };
};

const urls = getApiEndpoints(linkedinApiUrl, linkedinLoginUrl);

const getUserDetails = async <RT>(accessToken: string): Promise<RT> => {
  const url = `${urls.userDetails}&oauth2_access_token=${accessToken}`;
  const res = await got.get(url);
  return JSON.parse(res.body);
};

const getUserEmails = async (accessToken: string) => {
  const url = `${urls.userEmails}&oauth2_access_token=${accessToken}`;
  const res = await got.get(url);
  return JSON.parse(res.body);
};

const parseOrigName = (name: any): string | null => {
  // {
  //   "localized": {
  //       "en_US": "Mischa"
  //   },
  //   "preferredLocale": {
  //       "country": "US",
  //       "language": "en"
  //   }
  // }
  if (!name?.preferredLocale || !name?.localized) return null;
  const key = `${name.preferredLocale.language}_${name.preferredLocale.country}`;
  return name.localized[key] || null;
};
const parseLocale = (name: any): string | null => {
  if (!name?.preferredLocale?.country || !name?.preferredLocale?.language) return null;
  return `${name.preferredLocale.language}-${name.preferredLocale.country}`;
};

const parseImageUrl = (imageElements: any[]): string | null => {
  // find best image
  // see https://docs.microsoft.com/en-us/linkedin/shared/references/v2/profile/profile-picture
  if (!imageElements?.length) return null;
  let bestRes = 0;
  let best: any;
  imageElements.forEach((ele) => {
    const width = ele.data?.['com.linkedin.digitalmedia.mediaartifact.StillImage']?.storageSize?.width;
    if (!width || width < bestRes) return;
    bestRes = width;
    best = ele;
  });
  if (!best) return null;
  return best.identifiers?.[0]?.identifier || null;
};

interface LinkedInSecrets {
  LINKEDIN_CLIENT_ID: string;
  LINKEDIN_CLIENT_SECRET: string;
}
export const linkedin = (secrets: LinkedInSecrets) => {
  const clientId = secrets.LINKEDIN_CLIENT_ID;
  const redirUrl = process.env[ENV_COGNITO_REDIRECT_URI];
  if (!redirUrl) throw new Error(`missing ${redirUrl} in env`);
  return {
    getAuthorizeUrl: (client_id: any, scope: any, state: any, response_type: any) => {
      const newScope: string = filterOutScopesForLinkedin(scope);
      const queryParameters = new URLSearchParams();
      queryParameters.append('client_id', client_id);
      queryParameters.append('scope', newScope);
      queryParameters.append('state', state);
      queryParameters.append('response_type', response_type);
      queryParameters.append('redirect_uri', redirUrl);
      return `${urls.oauthAuthorize}?${queryParameters.toString()}`;
    },
    getUserInfo: (accessToken: string) => {
      console.debug('getUserInfo called');

      return Promise.all([
        getUserDetails<UserDetails>(accessToken).then((userDetails) => {
          console.debug(`userDetails: ${JSON.stringify(userDetails, undefined, 4)}`);
          const pictureElements = userDetails.profilePicture?.['displayImage~']?.elements || [];
          return {
            sub: userDetails.id,
            name: `${userDetails.localizedFirstName} ${userDetails.localizedLastName}`,
            vanityName: userDetails.vanityName || null, // won't be set unless the r_basicprofile scope is requested
            picture: parseImageUrl(pictureElements),
            locale: parseLocale(userDetails.firstName) || parseLocale(userDetails.lastName),
            website: `https://www.linkedin.com/in/${userDetails.vanityName}`,

            // custom attributes:
            'custom:firstNameOriginal': parseOrigName(userDetails.firstName),
            'custom:lastNameOriginal': parseOrigName(userDetails.lastName),
            'custom:headline': userDetails.localizedHeadline,
            'custom:vanityName': userDetails.vanityName,
          };
        }),
        getUserEmails(accessToken).then((userEmails: any) => {
          console.debug(`userEmails: ${JSON.stringify(userEmails, undefined, 4)}`);
          return {
            email: userEmails.elements[0]['handle~'].emailAddress,
          };
        }),
      ])
        .then((claims) => {
          const mergedClaims = claims.reduce((acc, claim) => ({ ...acc, ...claim }), {});
          console.debug('Resolved combined claims: %j', mergedClaims, {});
          return mergedClaims;
        })
        .catch((error: any) => {
          console.error(error);
          throw Error(error);
        });
    },
    getToken: async (code: any, state: any, host: any) => {
      const data = {
        grant_type: 'authorization_code',
        redirect_uri: process.env[ENV_COGNITO_REDIRECT_URI],
        client_id: secrets.LINKEDIN_CLIENT_ID,
        response_type: 'code',
        client_secret: secrets.LINKEDIN_CLIENT_SECRET,
        code,
        // State may not be present, so we conditionally include it
        ...(state && { state }),
      };

      const parameters = new URLSearchParams();
      Object.entries(data).forEach(([key, value]) => {
        parameters.append(key, value as string);
      });

      const url = `${urls.oauthToken}?${parameters.toString()}`;
      console.debug('Calling getToken', urls.oauthToken);
      const linkedinToken = await req.post(url);
      console.debug('Got linkedinToken');

      const payload = {
        // This was commented because Cognito times out in under a second
        // and generating the userInfo takes too long.
        // It means the ID token will be empty except for metadata.
        //  ...userInfo,
      };
      const idToken = await makeIdToken(payload, host, clientId);
      const tokenResponse = {
        ...linkedinToken,
        scope: linkedinScope.join(' '),
        token_type: 'bearer',
        id_token: idToken,
      };
      // disable me
      console.debug('Resolved token response: %j', tokenResponse, {});
      return tokenResponse;
    },
  };
};
