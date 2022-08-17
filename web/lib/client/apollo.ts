// from https://github.com/awslabs/aws-mobile-appsync-sdk-js#creating-a-client

import { ApolloClient, ApolloLink, createHttpLink, InMemoryCache } from '@apollo/client';
import { SentryLink } from 'apollo-link-sentry';
import { AUTH_TYPE, createAuthLink } from 'aws-appsync-auth-link';
import { createSubscriptionHandshakeLink } from 'aws-appsync-subscription-link';
import { getSession } from 'next-auth/react';
import { APPSYNC_ENDPOINT, REGION } from '../config/next';

const getCognitoAccessJwt = async () => {
  const session = await getSession();
  return session?.accessToken || '';
};

export function getAppSyncConfig() {
  const region = REGION;
  const appsyncEndpoint = APPSYNC_ENDPOINT;
  if (!region || !appsyncEndpoint) {
    console.debug('NEXT_PUBLIC_REGION and NEXT_PUBLIC_APPSYNC_ENDPOINT are not set; not authenticating with AppSync');
    return undefined;
  }

  return { region, appsyncEndpoint };
}

export const getApolloClient = () => {
  const appsyncConfig = getAppSyncConfig();

  let apolloLink;
  if (appsyncConfig) {
    const { region, appsyncEndpoint } = appsyncConfig;
    const auth = {
      region,
      type: AUTH_TYPE.AMAZON_COGNITO_USER_POOLS,
      jwtToken: getCognitoAccessJwt,
    } as const;
    const httpLink = createHttpLink({ uri: appsyncEndpoint });

    apolloLink = ApolloLink.from([
      new SentryLink({
        attachBreadcrumbs: {
          includeQuery: true,
          includeVariables: true,
          includeFetchResult: true,
          includeError: true,
        },
        setTransaction: true,
        uri: appsyncEndpoint,
      }),
      createAuthLink({ url: appsyncEndpoint, region, auth: auth }),
      createSubscriptionHandshakeLink({ url: appsyncEndpoint, region, auth }, httpLink),
    ]);
  }

  return new ApolloClient({
    link: apolloLink,
    cache: new InMemoryCache(),
    defaultOptions: {
      query: {
        // fetchPolicy: 'network-only',
      },
    },
  });
};
