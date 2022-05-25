import { AppSyncResolverHandler } from "aws-lambda";
import { GreetingState } from "../../../graphql/generated/gql";
import { GQL } from "../gql";

const GREETING = "Yo yo";

// sample query
export const getGreeting: AppSyncResolverHandler<
  unknown,
  GreetingState
> = async () => ({ currentGreeting: GREETING });

// sample mutation
export const greet: AppSyncResolverHandler<
  GQL.MutationGreetArgs,
  GQL.GreetingResponse
> = async ({ arguments: { name } }) => {
  return { greeting: `${GREETING}, ${name}!` };
};
