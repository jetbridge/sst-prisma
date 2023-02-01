import type { SSTConfig } from "sst"

const PROFILE = {
  default: "default",
}

const REGION = {
  default: "us-east-1"
}

export default {
  config(input) {
    const stage = input.stage || "dev"
    const region = REGION[stage] || REGION.default
    const profile = PROFILE[stage] || PROFILE.default

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

