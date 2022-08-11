import { StackContext } from '@serverless-stack/resources';
import { DnsValidatedCertificate, ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { HostedZone } from 'aws-cdk-lib/aws-route53';

export function Dns({ stack, app }: StackContext) {
  // route53 zone
  const hostedZoneName = process.env['HOSTED_ZONE_NAME'];
  const hostedZone = hostedZoneName
    ? HostedZone.fromLookup(stack, 'Zone', {
        domainName: hostedZoneName,
      })
    : undefined;

  // certificate (in our region)
  let certificateRegional: ICertificate | undefined, certificateGlobal: ICertificate | undefined;

  if (hostedZoneName && hostedZone) {
    certificateRegional = new DnsValidatedCertificate(stack, 'RegionalCertificate', {
      domainName: hostedZoneName,
      hostedZone,
      subjectAlternativeNames: [`*.${hostedZoneName}`],
    });
    // cert in us-east-1, required for cloudfront, cognito
    certificateGlobal =
      app.region === 'us-east-1'
        ? certificateRegional
        : new DnsValidatedCertificate(stack, 'GlobalCertificate', {
            domainName: hostedZoneName,

            hostedZone,
            subjectAlternativeNames: [`*.${hostedZoneName}`],
            region: 'us-east-1',
          });
  }

  return { certificateRegional, certificateGlobal, hostedZone, domainName: hostedZoneName };
}
