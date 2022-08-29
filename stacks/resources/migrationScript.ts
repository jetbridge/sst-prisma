import { App, Function, Script } from '@serverless-stack/resources';
import { RemovalPolicy } from 'aws-cdk-lib';
import { IVpc } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { ESM_REQUIRE_SHIM } from 'stacks';
import { LAYER_MODULES, PRISMA_VERSION } from '../layers';
import { PrismaLayer } from './prismaLayer';

interface DbMigrationScriptProps {
  vpc?: IVpc;
}

export class DbMigrationScript extends Construct {
  constructor(scope: Construct, id: string, { vpc }: DbMigrationScriptProps) {
    super(scope, id);

    const app = App.of(scope) as App;

    // lambda layer for migrations
    const migrationLayer = new PrismaLayer(this, 'PrismaMigrateLayer', {
      // retain for rollbacks
      removalPolicy: RemovalPolicy.RETAIN,
      description: 'Prisma migration engine and SDK',
      layerVersionName: app.logicalPrefixedName('prisma-migrate'),

      prismaVersion: PRISMA_VERSION,
      prismaEngines: ['migration-engine'],
      layerZipPath: `layers/migration-${PRISMA_VERSION}.zip`,
      prismaModules: ['@prisma/engines', '@prisma/engines-version', '@prisma/internals', '@prisma/client'],
    });

    const migrationFunction = new Function(this, 'MigrationScriptLambda', {
      vpc,
      enableLiveDev: false,
      handler: 'backend/src/db/migrationScript.handler',
      layers: [migrationLayer],
      srcPath: '.',
      bundle: {
        format: 'esm',
        commandHooks: {
          beforeBundling: () => [],
          beforeInstall: () => [],
          afterBundling: (inputDir, outputDir) => [
            `cp "${inputDir}/backend/prisma/schema.prisma" "${outputDir}"`,
            `cp -r "${inputDir}/backend/prisma/migrations" "${outputDir}"`,

            // @prisma/migrate wants this package.json to exist
            `cp -r "${inputDir}/backend/package.json" "${outputDir}/backend/src"`,
          ],
        },
        externalModules: LAYER_MODULES.concat(migrationLayer.externalModules),
        banner: ESM_REQUIRE_SHIM,
      },
      timeout: '3 minutes',
    });

    // script to run migrations for us during deployment
    new Script(this, 'MigrationScript', {
      onCreate: migrationFunction,
      onUpdate: migrationFunction,
    });
  }
}
