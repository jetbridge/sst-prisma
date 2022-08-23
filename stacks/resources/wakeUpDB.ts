import { ServerlessCluster } from 'aws-cdk-lib/aws-rds';
import { AwsCustomResource, AwsCustomResourcePolicy, PhysicalResourceId } from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';

export interface WakeDBProps {
  cluster: ServerlessCluster;
}

/**
 * Custom resource to wake up the database if it's gone to sleep.
 * Prevents errors running migrations or other tasks during deployment.
 */
export class WakeDB extends Construct {
  constructor(scope: Construct, id: string, { cluster }: WakeDBProps) {
    super(scope, id);

    // call modifyCurrentDBClusterCapacity with capacity=2 (min) to wake up the database
    // this could be improved by first checking if the capacity is currently 0
    // and by waiting for the DB to become available
    new AwsCustomResource(this, 'WakeDB', {
      onUpdate: {
        // will also be called for a CREATE event
        service: 'RDS',
        action: 'modifyCurrentDBClusterCapacity',
        parameters: {
          Capacity: 2,
          DBClusterIdentifier: cluster.clusterIdentifier,
          SecondsBeforeTimeout: 10,
          TimeoutAction: 'RollbackCapacityChange',
        },
        physicalResourceId: PhysicalResourceId.of(Date.now().toString()), // Update physical id to always fetch the latest version
      },
      policy: AwsCustomResourcePolicy.fromSdkCalls({
        resources: [cluster.clusterArn],
      }),
    });
  }
}
