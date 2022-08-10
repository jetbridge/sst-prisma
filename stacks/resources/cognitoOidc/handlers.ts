import { APIGatewayProxyEvent, Callback, Context } from 'aws-lambda';
import { OpenID } from './openid';
import { URLSearchParams } from 'url';

export const handler = (event: APIGatewayProxyEvent, _context: Context, callback: Callback) => {
  const { client_id, scope, state, response_type } = event.queryStringParameters || {};
  getOidcController(callback).authorize(client_id, scope, state, response_type);
};

export const token = (event: APIGatewayProxyEvent, _context: Context, callback: Callback) => {
  const body = parseBody(event);
  const query = event.queryStringParameters || {};
  const code = body.code || query.code;
  const state = body.state || query.state;
  if (code) {
    openid
      .getTokens(code, state, host)
      .then((tokens: any) => {
        // console.debug("Token for (%s, %s, %s) provided", code, state, host, {})
        respond.success(tokens);
      })
      .catch((error: any) => {
        console.error('Token for (%s, %s, %s) failed: %s', code, state, host, error.message || error, {});
        respond.error(error);
      });
  } else {
    const error = new Error('No code supplied');
    console.error('Token for (%s, %s, %s) failed: %s', code, state, host, error.message || error, {});
    respond.error(error);
  }
};

export const;
