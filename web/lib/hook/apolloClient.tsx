// from https://github.com/awslabs/aws-mobile-appsync-sdk-js#creating-a-client

import { ApolloClient, ApolloLink, ApolloProvider, createHttpLink, InMemoryCache } from '@apollo/client';
import { SentryLink } from 'apollo-link-sentry';
import { AUTH_TYPE, createAuthLink } from 'aws-appsync-auth-link';
import { createSubscriptionHandshakeLink } from 'aws-appsync-subscription-link';
import { useSession } from 'next-auth/react';
import React from 'react';
import { APPSYNC_ENDPOINT, REGION } from '../config/next';

export function useApolloClient() {
  const session = useSession();
  session.data?.user;

  const getCognitoAccessJwt = React.useCallback(async () => session.data?.accessToken || '', [session]);

  return getApolloClient(getCognitoAccessJwt);
}

export const ApolloClientProvider: React.FC = ({ children }) => {
  const client = useApolloClient();
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export function getAppSyncConfig() {
  const region = REGION;
  const appsyncEndpoint = APPSYNC_ENDPOINT;
  if (!region) throw new Error('NEXT_PUBLIC_REGION is not set');
  if (!appsyncEndpoint) throw new Error('NEXT_PUBLIC_APPSYNC_ENDPOINT is not set');

  return { region, appsyncEndpoint };
}

export const getApolloClient = (getCognitoAccessJwt: () => Promise<string>) => {
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
