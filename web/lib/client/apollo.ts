// from https://github.com/awslabs/aws-mobile-appsync-sdk-js#creating-a-client

import { ApolloClient, ApolloLink, createHttpLink, InMemoryCache } from '@apollo/client';
import { SentryLink } from 'apollo-link-sentry';
import { AUTH_TYPE, createAuthLink } from 'aws-appsync-auth-link';
import { createSubscriptionHandshakeLink } from 'aws-appsync-subscription-link';
import { getSession } from 'next-auth/react';
import { APPSYNC_ENDPOINT, AWS_REGION } from '../config/next';

const getCognitoAccessJwt = async () => {
  const session = await getSession();
  return session?.accessToken || '';
};

export function getAppSyncConfig() {
  const region = AWS_REGION;
  const appsyncEndpoint = APPSYNC_ENDPOINT;
  if (!region) throw new Error('NEXT_PUBLIC_REGION is not set');
  if (!appsyncEndpoint) throw new Error('NEXT_PUBLIC_APPSYNC_ENDPOINT is not set');

  return { region, appsyncEndpoint };
}

export const getApolloClient = () => {
  const { region, appsyncEndpoint } = getAppSyncConfig();
  const auth = {
    region,
    type: AUTH_TYPE.AMAZON_COGNITO_USER_POOLS,
    jwtToken: getCognitoAccessJwt,
  } as const;
  const httpLink = createHttpLink({ uri: appsyncEndpoint });

  const apolloLink = ApolloLink.from([
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
