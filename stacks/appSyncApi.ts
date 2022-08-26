import { AuthorizationType } from '@aws-cdk/aws-appsync-alpha';
import { AppSyncApi as SstAppSyncApi, StackContext, use } from '@serverless-stack/resources';
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
      'Query getGreeting': 'api/resolver/greeting.getGreeting',
      'Mutation greet': 'api/resolver/greeting.greet',
    },
  });

  stack.addOutputs({
    GraphqlApiEndpoint: api.url,
    GraphqlApiKey: api.cdk.graphqlApi.apiKey || 'none',
  });

  return { api, url: api.url };
}
