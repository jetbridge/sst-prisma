import * as sst from '@serverless-stack/resources';
import { getStack } from '@serverless-stack/resources';
import { Template } from 'aws-cdk-lib/assertions';
import { RestApi } from './restApi';

test('RestApi stack', () => {
  const app = new sst.App();
  // WHEN
  app.stack(RestApi);
  // THEN
  const template = Template.fromStack(getStack(RestApi));
  template.hasOutput('RestApiEndpoint', {});
});
