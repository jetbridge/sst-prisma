import { Stack, StackContext, Topic, App, use } from '@serverless-stack/resources';
import { Aspects, Duration } from 'aws-cdk-lib';
import { LoggingLevel, SlackChannelConfiguration } from 'aws-cdk-lib/aws-chatbot';
import { Effect, ManagedPolicy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { SLACK_ALERTS_CHANNEL_ID, SLACK_ALERTS_WORKSPACE_ID } from './config';
import { AddAlarmTopicAction, FunctionAlarms } from './resources/alarm';
import { Canary, Test, Runtime } from '@aws-cdk/aws-synthetics-alpha';
import { Schedule } from 'aws-cdk-lib/aws-events';
import { Code } from 'aws-cdk-lib/aws-lambda';
import path from 'path';
import { dirname } from 'desm';
import { Web } from './web';
import { TreatMissingData } from 'aws-cdk-lib/aws-cloudwatch';
import { SnsAction } from 'aws-cdk-lib/aws-cloudwatch-actions';

/**
 * Alarms and monitoring for our resources.
 * Primarily for alerting us when functions run into errors.
 */
export function Monitoring({ stack, app }: StackContext) {
  const alarmTopic = new Topic(stack, 'AlarmTopic', {});

  Aspects.of(app).add(new FunctionAlarms()); // fn errors -> alarm
  Aspects.of(app).add(new AddAlarmTopicAction(alarmTopic.cdk.topic)); // alarms -> topic

  createSynthetics(stack, app, alarmTopic);
  createSlackIntegration(stack, app, alarmTopic);
}

/**
 * Create scripts to check if your stuff is online.
 * Docs:
 *  * https://docs.aws.amazon.com/cdk/api/v2/docs/aws-synthetics-alpha-readme.html
 *  * https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Synthetics_Canaries.html
 * @param stack
 * @param app
 * @param alarmTopic
 */
function createSynthetics(stack: Stack, app: App, alarmTopic: Topic) {
  const { webUrl } = use(Web);
  const __dirname = dirname(import.meta.url);

  // check if the website is up
  const websiteUp = new Canary(stack, 'WebsiteUp', {
    schedule: Schedule.rate(Duration.minutes(5)),
    test: Test.custom({
      code: Code.fromAsset(path.join(__dirname, 'synthetics', 'websiteUp')),
      handler: 'index.handler',
    }),
    runtime: Runtime.SYNTHETICS_NODEJS_PUPPETEER_3_5,
    canaryName: app.logicalPrefixedName('website-up'),
    environmentVariables: {
      WEB_URL: webUrl,
    },
  });
  websiteUp
    .metricFailed()
    .createAlarm(stack, 'WebsiteUpAlarm', {
      evaluationPeriods: 1,
      threshold: 1,
      alarmDescription: `Cannot reach ${webUrl}`,
      treatMissingData: TreatMissingData.BREACHING,
    })
    .addAlarmAction(new SnsAction(alarmTopic.cdk.topic));
}

/**
 * Sends alarm notifications to a slack channel.
 * Configure in .env and the AWS Chatbot console.
 */
function createSlackIntegration(stack: Stack, app: App, alarmTopic: Topic) {
  if (!SLACK_ALERTS_WORKSPACE_ID || !SLACK_ALERTS_CHANNEL_ID)
    // not configured, skip
    return;

  // topic -> slack
  // connect AWS Chatbot to JetBridge Slack
  const slackChannel = new SlackChannelConfiguration(stack, 'SlackAlarms', {
    slackChannelConfigurationName: app.logicalPrefixedName('slack-alarms'),
    slackWorkspaceId: SLACK_ALERTS_WORKSPACE_ID,
    slackChannelId: SLACK_ALERTS_CHANNEL_ID,
    notificationTopics: [alarmTopic.cdk.topic], // alarmTopic -> Slack channel
    loggingLevel: LoggingLevel.INFO,
  });

  // give the bot permissions to access logs
  // based on https://docs.aws.amazon.com/chatbot/latest/adminguide/chatbot-iam-policies.html
  // add permission to read everything
  slackChannel.role?.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('ReadOnlyAccess'));
  // suggested to deny these
  slackChannel.addToRolePolicy(
    new PolicyStatement({
      effect: Effect.DENY,
      actions: [
        'iam:*',
        's3:GetBucketPolicy',
        'ssm:*',
        'sts:*',
        'kms:*',
        'cognito-idp:GetSigningCertificate',
        'ec2:GetPasswordData',
        'ecr:GetAuthorizationToken',
      ],
      resources: ['*'],
    })
  );
}
