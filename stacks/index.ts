import * as sst from '@serverless-stack/resources';
import { Web } from './web';
import { Network } from './network';
import { Auth } from './auth';
import { AppSyncApi } from './appSyncApi';
import { envVar } from 'common';
import { Layers } from './layers';
import { Secrets } from './secrets';
import { Database } from './database';
import { RestApi } from './restApi';
import { Dns } from './dns';

// deal with dynamic imports of node built-ins (e.g. "crypto")
// from https://github.com/evanw/esbuild/pull/2067#issuecomment-1073039746
// and hardcode __dirname for https://github.com/prisma/prisma/issues/14484
export const ESM_REQUIRE_SHIM = `await(async()=>{let{dirname:e}=await import("path"),{fileURLToPath:i}=await import("url");if(typeof globalThis.__filename>"u"&&(globalThis.__filename=i(import.meta.url)),typeof globalThis.__dirname>"u"&&(globalThis.__dirname='/var/task'),typeof globalThis.require>"u"){let{default:a}=await import("module");globalThis.require=a.createRequire(import.meta.url)}})();`;

export default function main(app: sst.App) {
  app.setDefaultFunctionProps({
    runtime: 'nodejs16.x',
    environment: {
      [envVar('STAGE')]: app.stage,
    },
    // N.B. bundle settings are defined in Layers
  });

  app
    .stack(Network)
    .stack(Dns)
    .stack(Layers)
    .stack(Database)
    .stack(Secrets)
    .stack(Auth)
    .stack(RestApi)
    .stack(AppSyncApi)
    .stack(Web);
}
