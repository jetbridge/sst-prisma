import { APIGatewayProxyEventV2 } from 'aws-lambda';

export const getBearerToken = (event: APIGatewayProxyEventV2) => {
  return new Promise((resolve, reject) => {
    // This method implements https://tools.ietf.org/html/rfc6750
    const authHeader = event.headers.authorization;
    if (!authHeader) console.warn(`getBearerToken no auth header`);
    if (authHeader) {
      // Section 2.1 Authorization request header
      // Should be of the form 'Bearer <token>'
      // We can ignore the 'Bearer ' bit
      const authValue = authHeader.split(' ')[1];
      resolve(authValue);
    } else if (event.queryStringParameters?.access_token) {
      // Section 2.3 URI query parameter
      const accessToken = event.queryStringParameters?.access_token;
      resolve(accessToken);
    } else if (event.headers['Content-Type'] === 'application/x-www-form-urlencoded' && event.body) {
      // Section 2.2 form encoded body parameter
      const body = JSON.parse(event.body);
      resolve(body.access_token);
    } else {
      const msg = 'No token specified in request';
      console.warn(msg);
      reject(new Error(msg));
    }
  });
};

export const getIssuer = (event: APIGatewayProxyEventV2) => {
  const host = event.headers.host || event.requestContext?.domainName;
  const stage = event.requestContext?.stage;

  if (!stage || stage === '$default') {
    return host;
  } else {
    return `${host}/${stage}`;
  }
};

export const parseBody = (event: APIGatewayProxyEventV2) => {
  const body = event.isBase64Encoded ? Buffer.from(event.body!, 'base64').toString('utf-8') : event.body;
  const contentType = event.headers['content-type'];
  if (!body) return {};
  if (contentType?.startsWith('application/x-www-form-urlencoded')) {
    const params = new URLSearchParams(body);
    return {
      code: params.get('code'),
      state: params.get('state'),
    };
  }
  if (contentType?.startsWith('application/json')) {
    return JSON.parse(body);
  }
  throw new Error(`Unsupported content type: ${contentType}`);
};
