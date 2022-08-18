import { StackContext, use } from '@serverless-stack/resources';
import { Network } from 'stacks/network';
import { DbMigrationScript } from './resources/migrationScript';

export function DatabaseMigrations({ stack }: StackContext) {
  const net = use(Network);

  new DbMigrationScript(stack, 'MigrationScript', { vpc: net.vpc });
}
