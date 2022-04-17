import * as sst from "@serverless-stack/resources";

export default class FrontendStack extends sst.Stack {
  constructor(scope: sst.App, id: string, props?: sst.StackProps) {
    super(scope, id, props);

    // Frontend
    const frontendSite = new sst.NextjsSite(this, "Site", {
      path: "frontend",
      environment: {
        REGION: scope.region,
      },
    });

    this.addOutputs({
      FrontendURL: frontendSite.url,
    });
  }
}
