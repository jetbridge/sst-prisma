import withBundleAnalyzer from '@next/bundle-analyzer';
import { resolve } from 'path';

const __dirname = resolve();

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
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

  experimental: {
    outputFileTracingRoot: resolve(__dirname, '..'),
  },
};

const bundleAnalyzer = withBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });
export default bundleAnalyzer(nextConfig);
