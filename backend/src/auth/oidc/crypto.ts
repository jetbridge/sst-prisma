/* eslint-disable @typescript-eslint/no-explicit-any */
import { GetPublicKeyCommand, KMSClient, SignCommand } from '@aws-sdk/client-kms';
import { Config } from '@serverless-stack/node/config';
import base64url from 'base64url';
import { exportJWK, importSPKI } from 'jose';

const getKeyArn = () => (Config as any).SIGNING_KEY_ARN;

// convert binary x509 DER to PEM
const formatPublicKey = (key: Uint8Array) =>
  `-----BEGIN PUBLIC KEY-----\n${Buffer.from(key).toString('base64')}\n-----END PUBLIC KEY-----`;

const ALG = 'RS256';

export const getPublicKey = async () => {
  // get public key from KMS
  const kmsClient = new KMSClient({});
  const getKeyCmd = new GetPublicKeyCommand({
    KeyId: getKeyArn(),
  });
  const res = await kmsClient.send(getKeyCmd);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const publicKey = await importSPKI(formatPublicKey(res.PublicKey!), res.KeySpec!);
  const publicJwk = await exportJWK(publicKey);

  return {
    alg: ALG,
    kid: getKeyArn(),
    ...publicJwk,
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
    alg: ALG,
    typ: 'JWT',
    kid: getKeyArn(),
  };
  return sign(headers, enrichedPayload);
};

export const sign = async (headers: any, payload: any) => {
  // iat
  payload.iat = Math.floor(Date.now() / 1000);

  // exp
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  payload.exp = Math.floor(tomorrow.getTime() / 1000);

  const headerEncoded = base64url(JSON.stringify(headers));
  const payloadEncoded = base64url(JSON.stringify(payload));

  // to sign
  const message = `${headerEncoded}.${payloadEncoded}`;
  const msgBuf = Buffer.from(message);

  // sign headers+payload with KMS
  const kmsClient = new KMSClient({});
  const encryptCall = new SignCommand({
    Message: msgBuf,
    KeyId: getKeyArn(),
    SigningAlgorithm: 'RSASSA_PKCS1_V1_5_SHA_256',
    MessageType: 'RAW',
  });
  const res = await kmsClient.send(encryptCall);
  if (!res.Signature) throw new Error('No signature');
  const sigBuf = Buffer.from(res.Signature);

  // format signature
  const signature = base64url(sigBuf);
  return `${message}.${signature}`;
};
