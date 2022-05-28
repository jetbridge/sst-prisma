import { colors } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import type { AppProps } from 'next/app';
import '../styles/globals.css';

const theme = createTheme({
  palette: {
    mode: 'dark',

    // adjust!
    primary: colors.lime,
    secondary: colors.teal,
  },
  typography: {
    fontFamily: 'SourceSansPro',
    fontSize: 18,
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <main
        style={{
          backgroundColor: '#2E3440',
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
  );
}

export default MyApp;
