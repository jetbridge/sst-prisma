import * as jwk from 'json-web-key';
import * as jwt from 'jsonwebtoken';

const KEY_ID = 'jwtRS256';

export const getPublicKey = (pubKey: string) => {
  const pemToJson = jwk.fromPEM(pubKey).toJSON();
  return {
    alg: 'RS256',
    kid: KEY_ID,
    ...pemToJson,
  };
};

export const makeIdToken = (payload: any, host: string, cert: string, githubClient: string) => {
  const enrichedPayload = {
    ...payload,
    iss: `https://${host}`,
    aud: githubClient,
  };
  return jwt.sign(enrichedPayload, cert, {
    expiresIn: '1h',
    algorithm: 'RS256',
    keyid: KEY_ID,
  });
};
