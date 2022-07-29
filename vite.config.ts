import { defineConfig, configDefaults } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  test: {
    globals: true,
    clearMocks: true,
    setupFiles: ['./testSetup'],
    environment: 'node',
    testTimeout: 10_000,
    teardownTimeout: 3_000,

    exclude: [
      ...configDefaults.exclude,
      '**/dist/**',
      '**/.build/**',
      'web/**', // web runs its own tests
    ],

    // parallelism:
    // minThreads: 1,
    // maxThreads: 1,
    // maxConcurrency: 1,
    threads: false,
  },
  plugins: [
    tsconfigPaths({
      loose: true,
    }),
  ],
});
