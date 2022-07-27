import * as sst from '@serverless-stack/resources';

export default class WebStack extends sst.Stack {
  constructor(scope: sst.App, id: string, props?: sst.StackProps) {
    super(scope, id, props);

    // Web
    // docs: https://docs.serverless-stack.com/constructs/NextjsSite
    const frontendSite = new sst.NextjsSite(this, 'Site', {
      path: 'web',
      environment: {
        NEXT_PUBLIC_REGION: scope.region,
      },
    });

    this.addOutputs({
      WebURL: frontendSite.url,
    });
  }
}
