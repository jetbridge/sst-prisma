import { Api, StackContext } from '@serverless-stack/resources';

export function RestApi({ stack }: StackContext) {
  const api = new Api(stack, 'RestApi', {
    defaults: { function: { timeout: '10 seconds' } },
    routes: {}, // can add HTTP routes here - https://docs.serverless-stack.com/constructs/Api#using-the-minimal-config
  });
  stack.addOutputs({
    RestApiEndpoint: api.url,
  });
}
