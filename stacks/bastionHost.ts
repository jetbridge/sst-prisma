import { StackContext, use } from '@serverless-stack/resources';
import { CfnOutput, Duration } from 'aws-cdk-lib';
import {
  BastionHostLinux,
  CfnEIP,
  CfnEIPAssociation,
  InstanceClass,
  InstanceSize,
  InstanceType,
  Peer,
  SubnetType,
} from 'aws-cdk-lib/aws-ec2';
import { ARecord, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { Database } from './database';
import { Dns } from './dns';
import { Network } from './network';

export const BastionHost = ({ stack, app }: StackContext) => {
  // set this to enable a bastion host
  const keypairName = process.env['SSH_KEYPAIR_NAME'];

  const { vpc, defaultLambdaSecurityGroup } = use(Network);
  const { rds } = use(Database);
  const { hostedZone } = use(Dns);

  const host = new BastionHostLinux(stack, 'LinuxHost', {
    vpc,
    instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.NANO),
    instanceName: app.logicalPrefixedName('bastion'),
    subnetSelection: { subnetType: SubnetType.PUBLIC },
    securityGroup: defaultLambdaSecurityGroup,
  });

  // SSH keypair
  host.instance.instance.keyName = keypairName;

  // allow DB access
  rds.cdk.cluster.connections.allowDefaultPortFrom(host);

  // allow public SSH access
  host.allowSshAccessFrom(Peer.anyIpv4(), Peer.anyIpv6());

  // give it a static IP
  const eip = new CfnEIP(stack, 'Ip');
  new CfnEIPAssociation(stack, 'BastionEIPAssociation', {
    eip: eip.ref,
    instanceId: host.instanceId,
  });
  new CfnOutput(stack, 'BastionIP', {
    value: eip.ref,
  });

  let publicHost = eip.ref;

  // give it a domain or an elastic IP
  if (hostedZone) {
    const aRec = new ARecord(stack, 'DomainV4', {
      zone: hostedZone,
      target: RecordTarget.fromIpAddresses(publicHost),
      recordName: `bastion.${hostedZone.zoneName}`,
      ttl: Duration.minutes(2),
    });
    new CfnOutput(stack, 'BastionHost', {
      value: aRec.domainName,
    });
    publicHost = aRec.domainName;
  }

  // copy and paste SSH command-line
  new CfnOutput(stack, 'BastionSSHCmd', {
    description: 'Bastion SSH command-line',
    value: `ssh -i ~/.ssh/${keypairName}.cer ec2-user@${publicHost}`,
  });

  return { host };
};
