import { AuthorizationType } from "@aws-cdk/aws-appsync-alpha";
import { AppSyncApi, Stack } from "@serverless-stack/resources";
import { Duration, Expiration } from "aws-cdk-lib";

// presently unused - requires auth
export class GraphqlApi extends AppSyncApi {
  constructor(scope: Stack, id: string) {
    super(scope, id, {
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
      schema: "graphql/schema.graphql",
      dataSources: {},

      // define resolvers here - https://docs.serverless-stack.com/constructs/AppSyncApi#using-the-minimal-config
      resolvers: {},
    });

    scope.addOutputs({
      GraphqlApiEndpoint: this.url,
      GraphqlApiKey: this.cdk.graphqlApi.apiKey || "none",
    });
  }
}
