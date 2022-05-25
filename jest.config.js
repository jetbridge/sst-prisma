import dotenv from 'dotenv';

// for prisma integration tests
// run `npm run pretest` in repo to make sure pg docker is running
dotenv.config({ path: '.env.jest' });

const transform = {
  '^.+\\.[jt]sx?$': [
    'jest-esbuild',
    {
      target: 'esnext',
      format: 'esm',
    },
  ],
};

export default {
  transform,
  maxWorkers: 1, // remove when we can enable runInBand for integration tests
  extensionsToTreatAsEsm: ['.ts', '.tsx', '.jsx'],
  roots: ['<rootDir>/stacks', '<rootDir>/src', '<rootDir>/test'],
  modulePaths: ['<rootDir>/stacks', '<rootDir>/src', '<rootDir>/test'],
};
