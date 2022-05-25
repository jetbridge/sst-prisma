import type { Stack } from "@serverless-stack/resources";
import {
  Secret as CdkSecret,
  SecretProps as CdkSecretProps,
} from "aws-cdk-lib/aws-secretsmanager";
import { APP_NAME } from "..";
import { ENV_VARS } from "../../src/env";
import { APP_SECRETS } from "../../src/secrets";

export interface SecretProps extends CdkSecretProps {
  secrets: Record<string, string>;
}

export default class Secret extends CdkSecret {
  constructor(scope: Stack, id: string, { secrets, ...props }: SecretProps) {
    super(scope, id, {
      ...props,
      description: APP_NAME + scope.stage,
      generateSecretString: {
        secretStringTemplate: JSON.stringify(secrets),
        generateStringKey: APP_SECRETS.APP,
      },
    });

    scope.addDefaultFunctionEnv({
      [ENV_VARS.APP_SECRET_ARN]: this.secretArn,
    });
    scope.addDefaultFunctionPermissions([[this, "grantRead"]]);
  }
}
