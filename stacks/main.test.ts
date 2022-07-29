import { Template } from 'aws-cdk-lib/assertions';
import * as sst from '@serverless-stack/resources';
import { MainStack } from './main';
import { test } from 'vitest';
import { getStack } from '@serverless-stack/resources';

test('Main Stack', () => {
  const app = new sst.App();
  // WHEN
  app.stack(MainStack);
  // THEN
  const template = Template.fromStack(getStack(MainStack));
  template.hasOutput('RestApiEndpoint', {});
});
