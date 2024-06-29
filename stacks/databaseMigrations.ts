import { StackContext, use } from 'sst/constructs';
import { Network } from 'stacks/network';
import { Database } from './database';
import { DbMigrationScript } from './resources/migrationScript';

export function DatabaseMigrations({ stack, app }: StackContext) {
  const net = use(Network);
  const { db } = use(Database);

  if (!db) return;

  // run migrations
  const dbMigrationScript = new DbMigrationScript(stack, 'MigrationScript', {
    vpc: net.vpc,
    dbSecretsArn: db.secret!.secretArn,
  });

  return  {  dbMigrationScript };
}
