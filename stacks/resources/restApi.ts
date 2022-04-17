import { Api } from "@serverless-stack/resources";
import { Construct } from "constructs";

export class RestApi extends Api {
  constructor(scope: Construct, id: string) {
    super(scope, id, {
      defaultFunctionProps: {
        timeout: 10,
      },
      routes: {
      },
    });
  }
}
