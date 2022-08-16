// from https://github.com/awslabs/aws-mobile-appsync-sdk-js#creating-a-client

import { ApolloClient, ApolloLink, createHttpLink, InMemoryCache } from '@apollo/client';
import { SentryLink } from 'apollo-link-sentry';
import { AUTH_TYPE, createAuthLink } from 'aws-appsync-auth-link';
import { createSubscriptionHandshakeLink } from 'aws-appsync-subscription-link';
import memoizee from 'memoizee';

// TODO: move me somewhere better
async function getCognitoAccessJwt(): Promise<string> {
  try {
    return ''; // here we should return our cognito JWT
  } catch (e) {
    console.debug(e);
  }
  return '';
}
export function getAppSyncConfig() {
  const region = process.env.NEXT_PUBLIC_REGION;
  const appsyncEndpoint = process.env.NEXT_PUBLIC_APPSYNC_ENDPOINT;

  if (!region) throw new Error('NEXT_PUBLIC_REGION is not set');
  if (!appsyncEndpoint) throw new Error('NEXT_PUBLIC_APPSYNC_ENDPOINT is not set');

  return { region, appsyncEndpoint };
}

export const getApolloClient = memoizee(() => {
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

  new ApolloClient({
    link: apolloLink,
    cache: new InMemoryCache(),
    defaultOptions: {
      query: {
        fetchPolicy: 'network-only',
      },
    },
  });
});
