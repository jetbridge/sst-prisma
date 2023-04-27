import { AuthorizationType } from 'aws-cdk-lib/aws-appsync';
import { AppSyncApi as SstAppSyncApi, StackContext, use } from 'sst/constructs';
import { Auth } from './auth';

export function AppSyncApi({ stack }: StackContext) {
  const auth = use(Auth);
  const api = new SstAppSyncApi(stack, 'AppSyncApi', {
    cdk: {
      graphqlApi: {
        authorizationConfig: {
          defaultAuthorization: {
            authorizationType: AuthorizationType.USER_POOL,
            userPoolConfig: { userPool: auth.userPool },
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

  return { api, url: api.url };
}
