import { Logger } from '@aws-lambda-powertools/logger';
import { APP_NAME } from '@common/index';

export const logger = new Logger({ serviceName: APP_NAME });
