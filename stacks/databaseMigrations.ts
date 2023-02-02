import { StackContext, use } from 'sst/constructs';
import { Network } from 'stacks/network';
import { Database } from './database';
import { DbMigrationScript } from './resources/migrationScript';
import { WakeDB } from './resources/wakeUpDB';

export function DatabaseMigrations({ stack, app }: StackContext) {
  const net = use(Network);
  const { cluster } = use(Database);

  // make sure DB is running before applying migration
  let wakeUp;
  if (!app.local) wakeUp = new WakeDB(stack, 'WakeDB', { cluster });

  // run migrations
  const dbMigrationScript = new DbMigrationScript(stack, 'MigrationScript', {
    vpc: net.vpc,
    dbSecretsArn: cluster.secret!.secretArn,
  });

  if (wakeUp) dbMigrationScript.node.addDependency(wakeUp);
}
