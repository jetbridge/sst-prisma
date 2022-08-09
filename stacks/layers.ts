import { StackContext } from '@serverless-stack/resources';
import { RemovalPolicy } from 'aws-cdk-lib';
import { PrismaLayer } from './resources/prismaLayer';

export const PRISMA_VERSION = '4.0.0';

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
      copyFiles: [{ from: 'backend/prisma/schema.prisma', to: 'src/schema.prisma' }],
      externalModules: prismaLayer.externalModules,
    },
  });
}
