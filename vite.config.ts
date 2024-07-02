import { defineConfig, configDefaults } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    tsconfigPaths({
      loose: true,
    }),
  ],

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

    // adjust these: https://vitest.dev/config/#pool
    pool: 'forks',
    poolOptions: {
      forks: {
        minForks: 0,
        maxForks: 3,
        isolate: true,
      },
      threads: {
        // just for some integration tests - run sequentially
        singleThread: true,
        minThreads: 1,
        maxThreads: 1,
      },
    },
  },
})
