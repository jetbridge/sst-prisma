/* eslint-disable @typescript-eslint/no-var-requires */
import withBundleAnalyzer from '@next/bundle-analyzer';
import { resolve } from 'path';

const __dirname = resolve();

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // minify faster
  swcMinify: true,

  reactStrictMode: false,
  transpilePackages: ['common'],

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

/**
 * @type {import('next').NextConfig}
 */
export default bundleAnalyzer({
  ...nextConfig,
  images: {
    domains: [
      // put your domains here
    ],
  },
});
