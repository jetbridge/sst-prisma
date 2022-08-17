/**
 * Init sentry when imported for usage with our lambdas.
 * Sentry is only initialized if inside a Lambda Function.
 * We check if the code is running inside Lambda looking at reserved environment variable
 * https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html\
 */
import { AWSLambda } from '@sentry/serverless';
import { Handler } from 'aws-lambda';
import { getSstStage } from 'common';

if (process.env['_HANDLER']) {
  AWSLambda.init({
    environment: getSstStage(),
    maxBreadcrumbs: 30,
    debug: false,
  });
}

export function wrapLambdaHandlerWithSentry(fn: Handler) {
  return AWSLambda.wrapHandler(fn);
}
