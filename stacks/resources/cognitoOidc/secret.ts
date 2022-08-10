import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { ISecret } from 'aws-cdk-lib/aws-secretsmanager';

export const getSecrets = async () => {
  const secretName = process.env.SECRET_NAME;
  if (!secretName) throw new Error(`Missing environment variable: SECRET_NAME`);

  const client = new SecretsManagerClient({});
  const req = new GetSecretValueCommand({ SecretId: secretName });
  const res = await client.send(req);
  if (!res.SecretString) throw new Error(`Missing secretString in ${secretName}`);
  return JSON.parse(res.SecretString || '{}');
};

export const OIDC_SECRETS = {
  jwtRS256Key: 'JWT_KEY', // private key for signing ID Token for OIDC
  jwtRS256KeyPub: 'JWT_KEY_PUB', // public key for signing ID Token for OIDC
  githubClientId: 'GITHUB_CLIENT_ID', // the client ID for Github OAuth
  githubClientSecret: 'GITHUB_CLIENT_SECRET', // the client secret for Github OAuth
  linkedinClientId: 'LINKEDIN_CLIENT_ID', // the client ID for Linkedin OAuth
  linkedinClientSecret: 'LINKEDIN_CLIENT_SECRET', // the client secret for Linkedin OAuth
} as const;

export function getOidcSecretValue(secret: ISecret, key: keyof typeof OIDC_SECRETS): string {
  return secret.secretValueFromJson(OIDC_SECRETS[key]).toString();
}
