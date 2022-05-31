import { AppSyncResolverEvent } from 'aws-lambda';
import { GreetingState } from '../../../graphql/generated/gql';
import { GQL } from '../gql';

export const GREETING = 'Yo yo';

// sample query
export const getGreeting = (): GreetingState => ({
  currentGreeting: GREETING,
});

// sample mutation
export const greet = ({ arguments: { name } }: AppSyncResolverEvent<GQL.MutationGreetArgs>): GQL.GreetingResponse => ({
  greeting: `${GREETING}, ${name}!`,
});
