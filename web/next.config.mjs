import { resolve } from 'path'
const __dirname = resolve()
const projectRoot = resolve(__dirname, '../')

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@common'],

  experimental: {
    // for open-next output
    outputFileTracingRoot: projectRoot,
    // don't include dev deps in the deployed bundle
    outputFileTracingExcludes: {
      '*': [
        './**/.prisma/client/libquery_engine-darwin*', // prisma mac binary
        './**/@swc/core-linux-x64-gnu*',
        './**/@swc/core-linux-x64-musl*',
        './**/@esbuild*',
        './**/rollup*',
        './**/terser*',
        './**/sharp*',
      ],
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '6001',
        pathname: '**',
      },
    ],
    minimumCacheTTL: 86400 * 365, // cache optimized images for a long time
  },

  // https://docs.sst.dev/constructs/NextjsSite#source-maps
  webpack: (config, options) => {
    if (!options.dev) {
      config.devtool = 'source-map'
    }
    return config
  },
}

export default nextConfig
