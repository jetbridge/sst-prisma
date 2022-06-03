// Utilities for emitting cloudwatch metrics from AWS Lambda
// https://awslabs.github.io/aws-lambda-powertools-typescript/latest/core/metrics/

import { Metrics, MetricUnits } from '@aws-lambda-powertools/metrics';
import { APP_NAME } from 'common';

export const metrics = new Metrics({ serviceName: APP_NAME });

// add your custom metric names here
export type MetricName = 'SaidHello';

export const incrementMetric = (metric: MetricName, count = 1) => metrics.addMetric(metric, MetricUnits.Count, count);
