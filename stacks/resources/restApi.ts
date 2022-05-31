import { Api } from '@serverless-stack/resources';
import { Construct } from 'constructs';

export class RestApi extends Api {
  constructor(scope: Construct, id: string) {
    super(scope, id, {
      defaults: { function: { timeout: '10 seconds' } },
      routes: {}, // can add HTTP routes here - https://docs.serverless-stack.com/constructs/Api#using-the-minimal-config
    });
  }
}
