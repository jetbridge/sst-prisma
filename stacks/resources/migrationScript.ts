import { App, Function, Script } from '@serverless-stack/resources';
import { RemovalPolicy } from 'aws-cdk-lib';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { PRISMA_VERSION } from './layers';
import { PrismaLayer } from './prismaLayer';

interface DbMigrationScriptProps {
  vpc: Vpc;
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
      prismaModules: ['@prisma/engines', '@prisma/engines-version', '@prisma/sdk', '@prisma/migrate', '@prisma/client'],
    });

    const migrationFunction = new Function(this, 'MigrationScriptLambda', {
      vpc,
      enableLiveDev: false,
      handler: 'backend/src/db/migrateScript.handler',
      layers: [migrationLayer],
      bundle: {
        copyFiles: [
          { from: 'backend/prisma/schema.prisma', to: 'schema.prisma' },
          { from: 'backend/prisma/migrations', to: 'migrations' },
        ],
        externalModules: migrationLayer.externalModules,
      },
      timeout: '5 minutes',
    });

    // script to run migrations for us during deployment
    // new Script(this, 'MigrationScript', {
    //   onCreate: migrationFunction,
    //   onUpdate: migrationFunction,
    // });
  }
}
