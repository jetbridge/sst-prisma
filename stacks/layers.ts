import { RemovalPolicy } from 'aws-cdk-lib';
import { StackContext } from 'sst/constructs';
import { PrismaLayer } from './resources/prismaLayer';

export const PRISMA_VERSION = '5.16.1';

export function Layers({ app, stack }: StackContext) {
  // shared prisma lambda layer
  const prismaLayer = new PrismaLayer(stack, 'PrismaLayer', {
    description: 'Prisma engine and library',
    layerVersionName: app.logicalPrefixedName('prisma'),
    prismaVersion: PRISMA_VERSION,

    // retain for rollbacks
    // removalPolicy: IS_PRODUCTION ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    removalPolicy: RemovalPolicy.RETAIN,

    prismaEngines: ['libquery_engine'],

    binaryTargets: ['linux-arm64-openssl-3.0.x'],
  });

  // const sentryLayer = getSentryLayerByLang(this)

  app.addDefaultFunctionLayers([prismaLayer]);
  app.addDefaultFunctionEnv(prismaLayer.environment);

  return {
    externalModules: prismaLayer.externalModules,
  };
}
