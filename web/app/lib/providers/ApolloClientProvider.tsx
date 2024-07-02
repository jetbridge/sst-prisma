'use client'

import React, { ReactNode } from 'react'
import { ApolloProvider } from '@apollo/client'
import { getApolloClient } from '@/app/lib/apollo/client'

export function useApolloClient() {
  return React.useMemo(() => getApolloClient(), [])
}

export const ApolloClientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const client = useApolloClient()
  return <ApolloProvider client={client}>{children}</ApolloProvider>
}
