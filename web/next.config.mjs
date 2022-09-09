import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const outputFileTracingRoot = path.join(__dirname, '../');
console.log({ outputFileTracingRoot });

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  /* config options here */

  swcMinify: true,

  // outputFileTracingRoot,
};

export default nextConfig;
