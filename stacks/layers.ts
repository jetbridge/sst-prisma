import { StackContext } from '@serverless-stack/resources';
import { RemovalPolicy } from 'aws-cdk-lib';
import { ESM_REQUIRE_SHIM } from 'stacks';
import { PrismaLayer } from './resources/prismaLayer';

export const PRISMA_VERSION = '4.2.1';

// default externalModules (not bundled with lambda function code)
export const LAYER_MODULES = ['encoding', '@prisma/client/runtime'];

export function Layers({ stack, app }: StackContext) {
  // shared prisma lambda layer
  const prismaLayer = new PrismaLayer(stack, 'PrismaLayer', {
    description: 'Prisma engine and library',
    layerVersionName: app.logicalPrefixedName('prisma'),
    prismaVersion: PRISMA_VERSION,

    // retain for rollbacks
    removalPolicy: RemovalPolicy.RETAIN,

    prismaEngines: ['libquery_engine'],
    layerZipPath: `layers/prisma-${PRISMA_VERSION}.zip`,
  });

  app.addDefaultFunctionLayers([prismaLayer]);
  app.addDefaultFunctionEnv(prismaLayer.environment);
  app.setDefaultFunctionProps({
    bundle: {
      format: 'esm',
      copyFiles: [{ from: '../prisma/schema.prisma', to: 'src/schema.prisma' }],
      externalModules: LAYER_MODULES.concat(prismaLayer.externalModules),
      banner: ESM_REQUIRE_SHIM,
      sourcemap: true,
    },
  });
}
