import { defineConfig, configDefaults } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react';

export default defineConfig({
  test: {
    globals: true,
    clearMocks: true,
    // setupFiles: ["./testSetup"],
    environment: 'happy-dom',

    exclude: [...configDefaults.exclude, '**/.next/**'],
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
