// from https://github.com/awslabs/aws-mobile-appsync-sdk-js#creating-a-client

import { ApolloProvider } from '@apollo/client';
import React, { ReactNode } from 'react';
import { getApolloClient } from '../client/apollo';

export function useApolloClient() {
  try {
    return React.useMemo(() => getApolloClient(), []);
  } catch (e) {
    console.error(e);
    return null;
  }
}

export const ApolloClientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const client = useApolloClient();
  if (!client) return <div>Missing configuration</div>;
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
