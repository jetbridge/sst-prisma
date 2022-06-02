import { logger } from '@backend/util/logger';
import { incrementMetric } from '@backend/util/metrics';
import { AppSyncResolverEvent } from 'aws-lambda';
import { GQL } from 'common';

export const GREETING = 'Yo yo';

// sample query
export const getGreeting = (): GQL.GreetingState => ({
  currentGreeting: GREETING,
});

// sample mutation
export const greet = ({ arguments: { name } }: AppSyncResolverEvent<GQL.MutationGreetArgs>): GQL.GreetingResponse => {
  incrementMetric('SaidHello');
  logger.debug('Saying greeting to', { name });

  return {
    greeting: `${GREETING}, ${name}!`,
  };
};
