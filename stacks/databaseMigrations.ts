import { StackContext, use } from '@serverless-stack/resources';
import { Network } from 'stacks/network';
import { Database } from './database';
import { DbMigrationScript } from './resources/migrationScript';
import { WakeDB } from './resources/wakeUpDB';

export function DatabaseMigrations({ stack }: StackContext) {
  const net = use(Network);
  const { cluster } = use(Database);

  // make sure DB is running before applying migrations
  new WakeDB(stack, 'WakeDB', { cluster });

  // run migrations
  new DbMigrationScript(stack, 'MigrationScript', { vpc: net.vpc });
}
