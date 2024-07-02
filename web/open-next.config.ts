import type { OpenNextConfig } from 'open-next/types/open-next.js'

// https://open-next.js.org/v3/config

const config = {
  default: {
    // This is the default server, similar to the server-function in open-next v2
    // You don't have to provide the below, by default it will generate an output
    // for normal lambda as in open-next v2
    // override: {
    //   wrapper: 'aws-lambda-streaming', // This is necessary to enable lambda streaming
    // },
  },

  // Below we define the functions that we want to deploy in a different server
  // functions: {
  //   ssr: {
  //     routes: ["app/api/trpc/[trpc]/route"], // For app dir, you need to include route|page, no need to include layout or loading
  //     patterns: ["api/*"], // patterns needs to be in a cloudfront compatible format, this will be used to generate the output
  //     override: {
  //       wrapper: "aws-lambda-streaming",
  //     },
  //     experimentalBundledNextServer: true, // This enables the bundled next server which is faster and reduce the size of the server
  //   },
  // },
} satisfies OpenNextConfig

export default config
export type Config = typeof config
