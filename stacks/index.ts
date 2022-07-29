import * as sst from '@serverless-stack/resources';
import { WebStack } from './web';
import { MainStack } from './main';

export default function main(app: sst.App) {
  app.stack(MainStack).stack(WebStack);
}
