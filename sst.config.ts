import type { SSTConfig } from "sst"

// you can configure your default profiles and regions to use here
const PROFILE = {
  default: "default",
}

const REGION = {
  default: "us-east-1"
}

export default {
  config(input) {
    const stage = input.stage || "dev"

    // uncomment to use your own default profiles and regions
    const region = undefined // REGION[stage] || REGION.default
    const profile = undefined // PROFILE[stage] || PROFILE.default

    return {
      name: "myapp",  // replace me
      region,
      profile: process.env.CI ? undefined : profile,
      stage,
    }
  },

  async stacks(app) {
    const appStacks = await import("./stacks")
    appStacks.default(app)
  },
} satisfies SSTConfig

