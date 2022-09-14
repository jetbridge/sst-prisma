import { defineConfig, configDefaults } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react';

export default defineConfig({
  test: {
    globals: true,
    clearMocks: true,
    environment: 'jsdom',

    exclude: [...configDefaults.exclude, '**/.next/**'],

    deps: {
      // we have a problem in the generated GQL client which causes the error 'Apollo.useMutation is not a function'
      // because of differences in code bundling and node module resolution
      // probably will be fixed via https://github.com/apollographql/apollo-client/pull/9697
      // and we can remove this then
      inline: [/\/common\//],
    },
  },
  plugins: [
    tsconfigPaths({
      loose: true,
      extensions: ['ts', 'tsx', 'scss', 'css'],
    }),
    react(),
    process.env.VITEST
      ? {
          name: 'css-preprocess',
          enforce: 'pre',
          transform(code, id) {
            if (/\.(css|sass|scss)$/.test(id)) return { code: '' };
            return null;
          },
        }
      : undefined,
  ],
});
