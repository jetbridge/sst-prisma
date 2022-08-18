import { AwsStub, mockClient } from 'aws-sdk-client-mock';
import {
  GetSecretValueCommand,
  SecretsManagerClient,
  ServiceInputTypes,
  ServiceOutputTypes,
} from '@aws-sdk/client-secrets-manager';
import { APP_SECRETS } from 'common';

// mock getting a secret from AWS Secrets Manager
let secretsMock: AwsStub<ServiceInputTypes, ServiceOutputTypes>;
export function mockSecret(secretName: APP_SECRETS, val: string) {
  if (!secretsMock) secretsMock = mockClient(SecretsManagerClient);

  secretsMock.on(GetSecretValueCommand).resolves({
    SecretString: JSON.stringify({ [secretName]: val }),
  });

  afterEach(() => {
    secretsMock.reset();
  });
}

export function areWeTestingWithVite(): boolean {
  return !!process.env.VITEST_WORKER_ID;
}

export const sleep = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};
