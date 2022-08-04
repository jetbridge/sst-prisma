import * as sst from '@serverless-stack/resources';
import { WebStack } from './web';
import { Backend } from './backend';

export default function main(app: sst.App) {
  app.stack(Backend).stack(WebStack);
}
