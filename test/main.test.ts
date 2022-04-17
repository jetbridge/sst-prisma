import { Template } from "aws-cdk-lib/assertions";
import * as sst from "@serverless-stack/resources";
import MainStack from "../stacks/main";

test("Main Stack", () => {
  const app = new sst.App();
  // WHEN
  const stack = new MainStack(app, "test-stack");
  // THEN
  const template = Template.fromStack(stack);
  template.resourceCountIs("AWS::Lambda::Function", 7);
});
