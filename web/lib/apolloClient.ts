// from https://github.com/awslabs/aws-mobile-appsync-sdk-js#creating-a-client

import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client';
import { Auth } from '@aws-amplify/auth';
import { SentryLink } from 'apollo-link-sentry';
import { createAuthLink } from 'aws-appsync-auth-link';
import { createSubscriptionHandshakeLink } from 'aws-appsync-subscription-link';
import memoizee from 'memoizee';
import { requireEnvVar } from 'common';

// TODO: move me somewhere better
async function getCognitoAccessJwt(): Promise<string> {
  try {
    return (await Auth.currentSession()).getAccessToken().getJwtToken();
  } catch (e) {
    console.debug(e);
  }
  return '';
}

export const getApolloClient = memoizee(() => {
  const uri = requireEnvVar('GRAPHQL_ENDPOINT');
  // const region = appSyncConfig.region;
  // const auth = {
  //   type: appSyncConfig.authenticationType as any,
  //   jwtToken: getCognitoAccessJwt,
  // };

  const apolloLink = ApolloLink.from([
    new SentryLink({
      attachBreadcrumbs: {
        includeQuery: true,
        includeVariables: true,
        includeFetchResult: true,
        includeError: true,
      },
      setTransaction: true,
      uri,
    }),
    // createAuthLink({ url:uri, region, auth: auth as any }),
    // createSubscriptionHandshakeLink({ url: uri, region, auth }, httpLink),
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
