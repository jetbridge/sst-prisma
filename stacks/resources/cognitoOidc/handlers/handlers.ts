import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { getOidcController } from './controller/getController';
import { getBearerToken, getIssuer, parseBody } from './util';

export const openIdConfiguration = async (event: APIGatewayProxyEventV2) => {
  return await getOidcController().openIdConfiguration(getIssuer(event));
};

export const authorize = async (event: APIGatewayProxyEventV2) => {
  const { client_id, scope, state, response_type } = event.queryStringParameters || {};
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return await getOidcController().authorize(client_id!, scope!, state!, response_type!);
};

export const token = async (event: APIGatewayProxyEventV2) => {
  const body = parseBody(event);
  const query = event.queryStringParameters || {};
  const code = body.code || query.code;
  const state = body.state || query.state;
  return await getOidcController().token(code, state, getIssuer(event));
};

export const jwks = async () => {
  return await getOidcController().jwks();
};

export const userinfo = async (event: APIGatewayProxyEventV2) => {
  return await getOidcController().userinfo(getBearerToken(event));
};
