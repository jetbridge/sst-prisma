import { defaultAppSyncMiddleware } from '@backend/middleware/lambda';
import { logger } from '@backend/util/logger';
import { incrementMetric } from '@backend/util/metrics';
import { AppSyncResolverEvent } from 'aws-lambda';
import { GreetingResponse, GreetingState, MutationGreetArgs } from 'common/generated/graphql/graphql';

export const GREETING = 'Yo yo';

// sample query
export const getGreeting = (): GreetingState => ({
  currentGreeting: GREETING,
});

// sample mutation
export const greetInner = async ({
  arguments: { name },
}: AppSyncResolverEvent<MutationGreetArgs>): Promise<GreetingResponse> => {
  incrementMetric('SaidHello');
  logger.debug('Saying greeting to', { name });

  return {
    greeting: `${GREETING}, ${name}!`,
  };
};
export const greet = defaultAppSyncMiddleware()(greetInner);
