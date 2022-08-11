import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';

export const getSecrets = async () => {
  const secretName = process.env.SECRET_NAME;
  if (!secretName) throw new Error(`Missing environment variable: SECRET_NAME`);

  const client = new SecretsManagerClient({});
  const req = new GetSecretValueCommand({ SecretId: secretName });
  const res = await client.send(req);
  if (!res.SecretString) throw new Error(`Missing secretString in ${secretName}`);
  return JSON.parse(res.SecretString || '{}');
};
