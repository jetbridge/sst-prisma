import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
  },
  typography: {
    fontFamily: "SourceSansPro",
    fontSize: 18,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "capitalize",
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        root: {
          backgroundColor: "transparent",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontSize: "1.2rem",
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          fontSize: "1.2rem",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontSize: "1.2rem",
        },
      },
    },
  },
});


function MyApp({ Component, pageProps }: AppProps) {
  return <ThemeProvider theme={theme}><main style={{ backgroundColor: "#2E3440", padding: 20, width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}> <Component {...pageProps} /></main ></ThemeProvider>
}

export default MyApp
