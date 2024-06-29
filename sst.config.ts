import type { SSTConfig } from 'sst';

process.env.SST_BUILD_CONCURRENCY = '8';

// AWS profile to use - what credentials to use
const PROFILE = {
  default: undefined,
} as const;

const REGION = {
  default: 'us-west-2',
} as const;

export default {
  config(input) {
    const stage = input.stage as string;
    const region = (stage && REGION[stage]) || REGION.default;
    const profile = (stage && PROFILE[stage]) || PROFILE.default;

    return {
      name: 'myapp', // replace me
      region,
      profile: process.env.CI ? undefined : profile,
      stage,
    };
  },

  async stacks(app) {
    const appStacks = await import('./stacks');
    appStacks.default(app);
  },
} satisfies SSTConfig;
