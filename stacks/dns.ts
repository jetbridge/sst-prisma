import { StackContext } from 'sst/constructs'
import { DnsValidatedCertificate, ICertificate } from 'aws-cdk-lib/aws-certificatemanager'
import { HostedZone } from 'aws-cdk-lib/aws-route53'
import { HOSTED_ZONE_NAME, WEB_DOMAIN } from './config'

export function Dns({ stack, app }: StackContext) {
  // route53 zone
  const hostedZoneName = HOSTED_ZONE_NAME

  // assumes the hosted zone already exists in route53
  const hostedZone = hostedZoneName
    ? HostedZone.fromLookup(stack, 'Zone', {
        domainName: hostedZoneName,
      })
    : undefined

  // certificate (in our region)
  let certificateRegional: ICertificate | undefined, certificateGlobal: ICertificate | undefined

  if (hostedZoneName && hostedZone) {
    certificateRegional = new DnsValidatedCertificate(stack, 'RegionalCertificate', {
      domainName: hostedZoneName,
      hostedZone,
      subjectAlternativeNames: [`*.${hostedZoneName}`],
    })
    // cert in us-east-1, required for cloudfront, cognito
    certificateGlobal =
      app.region === 'us-east-1'
        ? certificateRegional
        : new DnsValidatedCertificate(stack, 'GlobalCertificate', {
            domainName: hostedZoneName,

            hostedZone,
            subjectAlternativeNames: [`*.${hostedZoneName}`],
            region: 'us-east-1',
          })
  }

  return { certificateRegional, certificateGlobal, hostedZone, domainName: hostedZoneName }
}
