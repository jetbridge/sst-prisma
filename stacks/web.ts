import { App, Stack, StackContext, use } from '@serverless-stack/resources';
import { CfnOutput } from 'aws-cdk-lib';
import { Tracing, LambdaInsightsVersion } from 'aws-cdk-lib/aws-lambda';
import { BaseSiteEnvironmentOutputsInfo, Nextjs, NextjsProps } from 'cdk-nextjs-standalone';
import { Construct } from 'constructs';
import path from 'path';
import { AppSyncApi } from './appSyncApi';
import { Auth } from './auth';
import { IS_PRODUCTION } from './config';
import { Dns } from './dns';
import { Secrets } from './secrets';

export function Web({ stack, app }: StackContext) {
  const { userPool, webClient, cognitoDomainName } = use(Auth);
  const appSyncApi = use(AppSyncApi);
  const dns = use(Dns);
  const secrets = use(Secrets);

  // docs: https://docs.serverless-stack.com/constructs/NextjsSite
  const frontendSite = new NextjsSst(stack, 'Web', {
    nextjsPath: 'web',
    defaults: {
      distribution: {
        comment: `NextJS distribution for ${app.name} (${app.stage})`,
        customDomain: dns.domainName
          ? {
              domainName: dns.domainName,
              domainAlias: 'www.' + dns.domainName,
            }
          : undefined,
      },
      lambda: {
        memorySize: 1024,
        tracing: Tracing.ACTIVE,
        insightsVersion: LambdaInsightsVersion.VERSION_1_0_143_0,
      },
    },
    nodeEnv: IS_PRODUCTION ? 'production' : 'development',
    environment: {
      NEXTAUTH_URL: 'http://localhost:6020', // FIXME: how to pass in this URL?
      NEXTAUTH_SECRET: secrets.secret.secretValueFromJson('RANDOM').toString(), // FIXME https://github.com/nextauthjs/next-auth/discussions/5145 & https://github.com/serverless-stack/sst/issues/1986
      NEXT_PUBLIC_REGION: stack.region,
      NEXT_PUBLIC_APPSYNC_ENDPOINT: appSyncApi.api.url,
      NEXT_PUBLIC_COGNITO_CLIENT_ID: webClient.userPoolClientId,
      NEXT_PUBLIC_COGNITO_USER_POOL_ID: userPool.userPoolId,
      NEXT_PUBLIC_COGNITO_DOMAIN_NAME: cognitoDomainName,
    },
    app,
  });

  stack.addOutputs({
    WebURL: frontendSite.url,
  });
}

export interface NextjsSstProps extends NextjsProps {
  app: App;
}

class NextjsSst extends Nextjs {
  constructor(scope: Construct, id: string, props: NextjsSstProps) {
    const app = props.app;

    super(scope, id, {
      ...props,
      isPlaceholder: app.local,
      tempBuildDir: app.buildDir,
      defaults: {
        ...props.defaults,
        distribution: {
          ...props.defaults?.distribution,
          stageName: app.stage,
        },
      },

      // make path relative to the app root
      nextjsPath: path.isAbsolute(props.nextjsPath) ? path.relative(app.appPath, props.nextjsPath) : props.nextjsPath,
    });

    if (props.environment) this.registerSiteEnvironment(props);
  }

  protected registerSiteEnvironment(props: NextjsSstProps) {
    if (!props.environment) return;
    const environmentOutputs: Record<string, string> = {};
    for (const [key, value] of Object.entries(props.environment)) {
      const outputId = `SstSiteEnv_${key}`;
      const output = new CfnOutput(this, outputId, { value });
      environmentOutputs[key] = Stack.of(this).getLogicalId(output);
    }

    const app = this.node.root as App;
    app.registerSiteEnvironment({
      id: this.node.id,
      path: props.nextjsPath,
      stack: Stack.of(this).node.id,
      environmentOutputs,
    } as BaseSiteEnvironmentOutputsInfo);
  }
}
