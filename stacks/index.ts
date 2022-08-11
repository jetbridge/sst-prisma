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
