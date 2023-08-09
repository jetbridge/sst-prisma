import { StackContext, use } from 'sst/constructs';
import { Network } from 'stacks/network';
import { Database } from './database';
import { DbMigrationScript } from './resources/migrationScript';
import { WakeDB } from './resources/wakeUpDB';

export function DatabaseMigrations({ stack, app }: StackContext) {
  const net = use(Network);
  const { cluster } = use(Database);

  // using local DB, no need to run migrations in AWS
  if (app.local) return;

  // make sure DB is running before applying migration
  const wakeUp = new WakeDB(stack, 'WakeDB', { cluster });

  // run migrations
  const dbMigrationScript = new DbMigrationScript(stack, 'MigrationScript', {
    vpc: net.vpc,
    dbSecretsArn: cluster.secret!.secretArn,
  });

  dbMigrationScript.node.addDependency(wakeUp);
}
