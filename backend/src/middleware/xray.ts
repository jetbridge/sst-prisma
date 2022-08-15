import middy from '@middy/core';
import { tracer } from '@backend/util/tracer';
import { AppSyncIdentityCognito, AppSyncResolverEvent } from 'aws-lambda';

export const appSyncXrayMiddleware = (): middy.MiddlewareObj<AppSyncResolverEvent<unknown>, unknown> => {
  const xrayBefore: middy.MiddlewareFn<AppSyncResolverEvent<unknown>, unknown> = async (request): Promise<void> => {
    // pull out some auth data we'd like to attach to the request in xray
    const email = (request.event.identity as AppSyncIdentityCognito)?.claims?.email;
    const username = (request.event.identity as AppSyncIdentityCognito)?.username;
    const sourceIps = (request.event.identity as AppSyncIdentityCognito)?.sourceIp?.join(',');

    // annotate trace
    if (username) tracer.putAnnotation('username', username);
    if (email) tracer.putAnnotation('email', email);
    if (sourceIps) tracer.putAnnotation('sourceIps', sourceIps);
  };

  return {
    before: xrayBefore,
  };
};
