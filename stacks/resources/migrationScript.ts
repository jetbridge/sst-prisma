import { RemovalPolicy } from 'aws-cdk-lib';
import { IVpc } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { App, Function, Script } from 'sst/constructs';
import { LAYER_MODULES, PRISMA_VERSION } from '../layers';
import { PrismaLayer } from './prismaLayer';

interface DbMigrationScriptProps {
  vpc?: IVpc;
  dbSecretsArn: string;
}

export class DbMigrationScript extends Construct {
  constructor(scope: Construct, id: string, { vpc, dbSecretsArn }: DbMigrationScriptProps) {
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
      runtime: 'nodejs18.x',
      copyFiles: [
        { from: 'backend/prisma/schema.prisma' },
        { from: 'backend/prisma/migrations' },
        { from: 'backend/prisma/schema.prisma', to: 'backend/src/db/schema.prisma' },
        { from: 'backend/prisma/migrations', to: 'backend/src/db/migrations' },
        { from: 'backend/package.json', to: 'backend/src/package.json' },
      ],

      nodejs: {
        format: 'cjs',
        esbuild: { external: [...LAYER_MODULES, ...(migrationLayer.externalModules || [])], target: 'node18' },
      },
      timeout: '3 minutes',
      environment: {
        DB_SECRET_ARN: dbSecretsArn,
      },
    });

    // script to run migrations for us during deployment
    new Script(this, 'MigrationScript', {
      onCreate: migrationFunction,
      onUpdate: migrationFunction,
    });
  }
}
