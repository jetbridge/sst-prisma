import type { SSTConfig } from 'sst';

// you can configure your default profiles and regions to use here
// map of stage to profile name
const PROFILE = {
  default: undefined,
};
// map of stage to region
const REGION = {
  default: undefined,
};

export default {
  config(input) {
    const stage = input.stage;

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
