import * as sst from '@serverless-stack/resources';
import FrontendStack from './frontend';
import MainStack from './main';

export default function main(app: sst.App): void {
  new MainStack(app, 'main');
  new FrontendStack(app, 'frontend');
}
