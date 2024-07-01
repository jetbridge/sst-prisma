'use client';

import { ApolloProvider } from '@apollo/client';
import React, { ReactNode } from 'react';
import { getApolloClient } from './apollo';

export function useApolloClient() {
  return React.useMemo(() => getApolloClient(), []);
}

export const ApolloClientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const client = useApolloClient();
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
