import { SnsAction } from 'aws-cdk-lib/aws-cloudwatch-actions';
import { ITopic } from 'aws-cdk-lib/aws-sns';
import { Function } from 'aws-cdk-lib/aws-lambda';
import { IConstruct } from 'constructs';
import { IAspect, Stack } from 'aws-cdk-lib';
import { Alarm, AlarmBase, AlarmProps, ComparisonOperator, Metric, TreatMissingData } from 'aws-cdk-lib/aws-cloudwatch';
import { MetricName, metricNamespace } from 'backend/src/util/metrics';

interface AlarmForMetricProps extends Omit<AlarmProps, 'metric' | 'threshold' | 'evaluationPeriods'> {
  metric: MetricName;
  alarmDescription: string;
}

/**
 * Generate an alarm whenever a custom metric is reported.
 */
export class AlarmForMetric extends Alarm {
  constructor(scope: Stack, id: string, { metric, alarmDescription, ...rest }: AlarmForMetricProps) {
    super(scope, id, {
      ...rest,
      evaluationPeriods: 1,
      threshold: 1,
      comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      alarmDescription,
      treatMissingData: TreatMissingData.NOT_BREACHING,
      metric: new Metric({
        namespace: metricNamespace,
        metricName: metric,
      }),
    });
  }
}

/**
 * Create CloudWatch alarms for lambda function errors.
 */
export class FunctionAlarms implements IAspect {
  private alarmId;

  constructor() {
    this.alarmId = 1;
  }

  public visit(node: IConstruct): void {
    // is this node a function of ours?
    if (node instanceof Function) {
      if (node.node.id.includes('MetadataUploaderFunction')) return; // skip metadata uploader utility functions

      node.metricErrors().createAlarm(Stack.of(node), `Alarm${this.alarmId++}-${node.node.id}`, {
        evaluationPeriods: 1,
        threshold: 1,
        alarmDescription: `Function errors for ${node.node.id}`,
        treatMissingData: TreatMissingData.NOT_BREACHING,
      });
    }
  }
}

/**
 * Adds the action to all alarms to go to our alarmTopic (which goes to slack).
 */
export class AddAlarmTopicAction implements IAspect {
  constructor(protected alarmTopic: ITopic) {}

  public visit(node: IConstruct): void {
    // N.B.: doesn't find alarms created by FunctionAlarms
    if (node instanceof AlarmBase) {
      node.addAlarmAction(new SnsAction(this.alarmTopic));
    }
  }
}
