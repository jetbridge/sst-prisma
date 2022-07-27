import { AwsStub, mockClient } from 'aws-sdk-client-mock';
import {
  GetSecretValueCommand,
  SecretsManagerClient,
  ServiceInputTypes,
  ServiceOutputTypes,
} from '@aws-sdk/client-secrets-manager';
import { APP_SECRETS } from 'common';

// mock getting webhook signing secret
let secretsMock: AwsStub<ServiceInputTypes, ServiceOutputTypes>;
export function mockSecret(secretName: APP_SECRETS, val: string) {
  if (!secretsMock) secretsMock = mockClient(SecretsManagerClient);

  secretsMock.on(GetSecretValueCommand).resolves({
    SecretString: JSON.stringify({ [secretName]: val }),
  });
}

afterEach(() => {
  secretsMock.reset();
});
