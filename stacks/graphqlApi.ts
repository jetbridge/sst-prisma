import { AuthorizationType } from '@aws-cdk/aws-appsync-alpha';
import { AppSyncApi as SstAppSyncApi, StackContext } from '@serverless-stack/resources';
import { Duration, Expiration } from 'aws-cdk-lib';

export function AppSyncApi({ stack }: StackContext) {
  const api = new SstAppSyncApi(stack, 'AppSyncApi', {
    cdk: {
      graphqlApi: {
        authorizationConfig: {
          defaultAuthorization: {
            authorizationType: AuthorizationType.API_KEY,
            apiKeyConfig: {
              expires: Expiration.after(Duration.days(365)),
            },
          },
        },
      },
    },
    schema: 'common/graphql/generated/schema.graphql',
    dataSources: {},

    // define resolvers here - https://docs.serverless-stack.com/constructs/AppSyncApi#using-the-minimal-config
    resolvers: {
      'Query getGreeting': 'backend/src/api/resolver/greeting.getGreeting',
      'Mutation greet': 'backend/src/api/resolver/greeting.greet',
    },
  });

  stack.addOutputs({
    GraphqlApiEndpoint: api.url,
    GraphqlApiKey: api.cdk.graphqlApi.apiKey || 'none',
  });
}
