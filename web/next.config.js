const path = require('path');

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,

  // minify faster
  swcMinify: true,
  experimental: {
    // we don't need to import EVERY component or icon
    // this rewrites imports to only import what we need from MUI
    modularizeImports: {
      '@mui/material': {
        transform: '@mui/material/{{member}}',
      },
      '@mui/icons-material': {
        transform: '@mui/icons-material/{{member}}',
      },
    },
    outputFileTracingRoot: path.join(__dirname, '..'),
  },
};

module.exports = nextConfig;
