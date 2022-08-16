import * as sst from '@serverless-stack/resources';
<<<<<<<< HEAD:stacks/backend.test.ts
import { Backend } from './backend';
import { test } from 'vitest';
========
>>>>>>>> origin/master:stacks/restApi.test.ts
import { getStack } from '@serverless-stack/resources';
import { Template } from 'aws-cdk-lib/assertions';
import { test } from 'vitest';
import { RestApi } from './restApi';

<<<<<<<< HEAD:stacks/backend.test.ts
test('Backend stack', () => {
  const app = new sst.App();
  // WHEN
  app.stack(Backend);
  // THEN
  const template = Template.fromStack(getStack(Backend));
========
test('RestApi stack', () => {
  const app = new sst.App();
  // WHEN
  app.stack(RestApi);
  // THEN
  const template = Template.fromStack(getStack(RestApi));
>>>>>>>> origin/master:stacks/restApi.test.ts
  template.hasOutput('RestApiEndpoint', {});
});
