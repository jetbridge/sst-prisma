import { injectLambdaContext } from '@aws-lambda-powertools/logger';
import { logMetrics } from '@aws-lambda-powertools/metrics';
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer';

import { logger } from '@backend/util/logger';
import { metrics } from '@backend/util/metrics';
import { tracer } from '@backend/util/tracer';
import middy from '@middy/core';
import type { Handler } from 'aws-lambda';

const DEFAULT_MIDDLEWARE = [
  injectLambdaContext(logger),
  captureLambdaHandler(tracer),
  logMetrics(metrics, { captureColdStartMetric: true }),
];

/**
 * A function wrapper that adds middleware to your lambda functions.
 * @param handler Your Lambda handler function
 * @returns Function wrapped with middleware
 */
export const defaultMiddleware = (handler: Handler) => middy(handler).use(DEFAULT_MIDDLEWARE);
