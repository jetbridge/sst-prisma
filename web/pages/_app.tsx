import * as colors from '@mui/material/colors';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import { ApolloClientProvider } from 'web/lib/hook/apolloClient';
import '../styles/globals.css';

const theme = createTheme({
  palette: {
    mode: 'dark',

    // adjust!
    primary: colors.lime,
    secondary: colors.teal,
    text: { primary: '#b7bfdb' },
  },
  typography: {
    fontFamily: 'SourceSansPro',
    fontSize: 18,
  },
});

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps<{ session: Session }>) {
  return (
    <SessionProvider session={session}>
      <ApolloClientProvider>
        <ThemeProvider theme={theme}>
          <main
            style={{
              backgroundColor: '#272f36',
              padding: 20,
              width: '100vw',
              height: '100vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Component {...pageProps} />
          </main>
        </ThemeProvider>
      </ApolloClientProvider>
    </SessionProvider>
  );
}

export default MyApp;
