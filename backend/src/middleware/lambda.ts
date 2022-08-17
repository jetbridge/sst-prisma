/* eslint-disable @typescript-eslint/no-explicit-any */
import { injectLambdaContext } from '@aws-lambda-powertools/logger';
import { logMetrics } from '@aws-lambda-powertools/metrics';
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer';
import { logger } from '@backend/util/logger';
import { metrics } from '@backend/util/metrics';
import { tracer } from '@backend/util/tracer';
import middy from '@middy/core';
import { Callback, Context } from 'aws-lambda';
import { wrapLambdaHandlerWithSentry } from './sentryLambdaWrapper';
import { appSyncXrayMiddleware } from './xray';

export type Handler<TEvent = unknown, TResult = unknown> = (
  event: TEvent,
  context: Context,
  callback: Callback<TResult>
) => void | Promise<TResult>;

const DEFAULT_MIDDLEWARE = [
  injectLambdaContext(logger),
  captureLambdaHandler(tracer),
  logMetrics(metrics, { captureColdStartMetric: true }),
];

const DEFAULT_APPSYNC_MIDDLEWARE = [
  ...DEFAULT_MIDDLEWARE,

  // add xray annotations
  appSyncXrayMiddleware(),
];

// if you want it
const isSentryEnabled = false;

/**
 * Default middleware to apply to all resolver functions.
 * It also wraps the middy final handler with Sentry.
 */
export const defaultAppSyncMiddleware = <T extends (...args: any[]) => any>() => {
  return (resolverFunc: T) => {
    // apply middleware
    const handlerWithMiddlewares = middy(resolverFunc).use(DEFAULT_APPSYNC_MIDDLEWARE);

    // sentry wrapper
    if (isSentryEnabled) return wrapLambdaHandlerWithSentry(handlerWithMiddlewares);
    else return handlerWithMiddlewares;
  };
};

/**
 * Middleware for any lambda function.
 */
export const defaultLambdaMiddleware = <T extends (...args: any[]) => any>() => {
  return (resolverFunc: T) => {
    // apply middleware
    const handlerWithMiddlewares = middy(resolverFunc).use(DEFAULT_MIDDLEWARE);

    // sentry wrapper
    if (isSentryEnabled) return wrapLambdaHandlerWithSentry(handlerWithMiddlewares);
    else return handlerWithMiddlewares;
  };
};
