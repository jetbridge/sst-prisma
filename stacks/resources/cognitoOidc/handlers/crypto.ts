/* eslint-disable @typescript-eslint/no-explicit-any */
import { KMSClient, SignCommand, GetPublicKeyCommand } from '@aws-sdk/client-kms';
import base64url from 'base64url';
import { ENV_SIGNING_KEY_ARN } from '../types';
import jwk from 'json-web-key';

const getKeyArn = () => {
  const arn = process.env[ENV_SIGNING_KEY_ARN];
  if (!arn) throw new Error(`${ENV_SIGNING_KEY_ARN} is not set`);
  return arn;
};

const KEY_ID = 'jwtRS256';

export const getPublicKey = async () => {
  // get public key
  const kmsClient = new KMSClient({});
  const getKeyCmd = new GetPublicKeyCommand({
    KeyId: getKeyArn(),
  });
  console.log('getPublicKey', getKeyCmd);
  const res = await kmsClient.send(getKeyCmd);
  console.log('res.PublicKey', res.PublicKey);

  const pemToJson = jwk.fromPEM(res.PublicKey).toJSON();
  return {
    alg: 'RS256',
    kid: KEY_ID,
    ...pemToJson,
  };
};

export const makeIdToken = async (payload: any, host: string, clientId: string) => {
  const enrichedPayload = {
    ...payload,
    iss: `https://${host}`,
    aud: clientId,
  };

  // sign
  const headers = {
    alg: 'RS256',
    typ: 'JWT',
  };
  return sign(headers, enrichedPayload);
};

export const sign = async (headers: any, payload: any) => {
  payload.iat = Math.floor(Date.now() / 1000);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  payload.exp = Math.floor(tomorrow.getTime() / 1000);

  const tokenComponents = {
    header: base64url(JSON.stringify(headers)),
    payload: base64url(JSON.stringify(payload)),
    signature: '',
  };

  const message = Buffer.from(tokenComponents.header + '.' + tokenComponents.payload);

  const kmsClient = new KMSClient({});
  const encryptCall = new SignCommand({
    Message: message,
    KeyId: getKeyArn(),
    SigningAlgorithm: 'RSASSA_PKCS1_V1_5_SHA_256',
    MessageType: 'RAW',
  });
  const res = await kmsClient.send(encryptCall);
  if (!res.Signature) throw new Error('No signature');

  tokenComponents.signature = Buffer.from(res.Signature)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return tokenComponents.header + '.' + tokenComponents.payload + '.' + tokenComponents.signature;
};
