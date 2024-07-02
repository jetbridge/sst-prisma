import type { SSTConfig } from 'sst'
import { ConfigOptions } from 'sst/project.js'

process.env.SST_BUILD_CONCURRENCY = '8'

// you can configure your default profiles and regions to use here
// map of stage to profile name
const PROFILE: { [key: string]: string | undefined } = {
  default: undefined,
}
// map of stage to region
const REGION: { [key: string]: string | undefined } = {
  default: undefined,
}

export default {
  config(input) {
    const stage = input.stage

    const region = (stage && REGION[stage]) || REGION.default || process.env.AWS_DEFAULT_REGION
    const profile = (stage && PROFILE[stage]) || PROFILE.default || process.env.AWS_PROFILE

    return {
      name: 'myapp', // replace me
      ...(region && { region }),
      ...(profile && !process.env.CI && { profile }),
      stage,
    } as ConfigOptions
  },

  async stacks(app) {
    const appStacks = await import('./stacks')
    appStacks.default(app)
  },
} satisfies SSTConfig
