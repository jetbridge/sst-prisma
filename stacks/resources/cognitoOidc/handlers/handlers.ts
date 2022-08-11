/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { APIGatewayProxyEventV2, Callback, Context } from 'aws-lambda';
import { getOidcController } from './controller/getController';
import { getBearerToken, getIssuer, parseBody } from './util';

export const openIdConfiguration = (event: APIGatewayProxyEventV2, _context: Context, callback: Callback) => {
  getOidcController(callback).openIdConfiguration(getIssuer(event));
};

export const authorize = (event: APIGatewayProxyEventV2, _context: Context, callback: Callback) => {
  const { client_id, scope, state, response_type } = event.queryStringParameters || {};
  getOidcController(callback).authorize(client_id!, scope!, state!, response_type!);
};

export const token = (event: APIGatewayProxyEventV2, _context: Context, callback: Callback) => {
  const body = parseBody(event);
  const query = event.queryStringParameters || {};
  const code = body.code || query.code;
  const state = body.state || query.state;
  getOidcController(callback).token(code, state, getIssuer(event));
};

export const jwks = (_event: APIGatewayProxyEventV2, _context: Context, callback: Callback) => {
  getOidcController(callback).jwks();
};

export const userinfo = (event: APIGatewayProxyEventV2, _context: Context, callback: Callback) => {
  getOidcController(callback).userinfo(getBearerToken(event));
};
