import { App, Stack } from "@serverless-stack/resources";
import { RemovalPolicy } from "aws-cdk-lib";
import { PrismaLayer } from "./prismaLayer";
import { Construct } from "constructs";

export const PRISMA_VERSION = "3.12.0";

export class Layers extends Construct {
  constructor(scope: Stack, id: string) {
    super(scope, id);

    const app = App.of(scope) as App;

    // shared prisma lambda layer
    const prismaLayer = new PrismaLayer(this, "PrismaLayer", {
      description: "Prisma engine and library",
      layerVersionName: app.logicalPrefixedName("prisma"),
      prismaVersion: PRISMA_VERSION,

      // retain for rollbacks
      removalPolicy: RemovalPolicy.RETAIN,

      prismaEngines: ["libquery_engine"],
      layerZipPath: "layers/prisma.zip",
    });

    scope.addDefaultFunctionLayers([prismaLayer]);
    scope.addDefaultFunctionEnv(prismaLayer.environment);
    scope.setDefaultFunctionProps({
      bundle: {
        copyFiles: [{ from: "prisma/schema.prisma", to: "src/schema.prisma" }],
        externalModules: prismaLayer.externalModules,
      },
    });
  }
}
