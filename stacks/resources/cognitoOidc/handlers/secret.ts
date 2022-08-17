import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { ENV_SECRET_NAME } from '../types';

export const getOidcSecrets = async () => {
  const secretName = process.env[ENV_SECRET_NAME];
  if (!secretName) throw new Error(`Missing environment variable: ${secretName}`);

  const client = new SecretsManagerClient({});
  const req = new GetSecretValueCommand({ SecretId: secretName });
  const res = await client.send(req);
  if (!res.SecretString) throw new Error(`Missing secretString in ${secretName}`);
  return JSON.parse(res.SecretString || '{}');
};
