import { Template } from 'aws-cdk-lib/assertions';
import * as sst from '@serverless-stack/resources';
import { Backend } from './backend';
import { test } from 'vitest';
import { getStack } from '@serverless-stack/resources';

test('Backend stack', () => {
  const app = new sst.App();
  // WHEN
  app.stack(Backend);
  // THEN
  const template = Template.fromStack(getStack(Backend));
  template.hasOutput('RestApiEndpoint', {});
});
