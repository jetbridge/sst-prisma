import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import memoize from 'memoizee';
import { APP_SECRETS, ENV_VARS } from '../../common/env';

type SecretName = typeof APP_SECRETS[keyof typeof APP_SECRETS];
type SecretValue = string | undefined; // technically can be any json value type (but it's probably always a string)
type SecretMap = Record<SecretName, SecretValue>;

// load multiple key/values from AWS Secrets Manager
async function getSecrets_(): Promise<SecretMap> {
  // get the secret name from environment
  const secretName = process.env[ENV_VARS.APP_SECRET_ARN];
  if (!secretName) throw new Error(`Secret ${secretName} is missing in environment`);

  const client = new SecretsManagerClient({});
  const req = new GetSecretValueCommand({ SecretId: secretName });
  const res = await client.send(req);
  if (!res.SecretString) throw new Error(`Missing secretString in ${secretName}`);
  const secrets = JSON.parse(res.SecretString);
  return secrets;
}
// cache the getSecrets_ calls
export const getSecrets = memoize(getSecrets_);

export const requireSecret = async (secretName: keyof typeof APP_SECRETS): Promise<string> => {
  const secrets = await getSecrets();
  const val = secrets[secretName];
  if (!val) throw new Error(`Required secret not found: ${secretName}`);
  return val;
};
