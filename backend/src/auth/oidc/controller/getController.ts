// import { github } from './github';
import { OpenID } from '../openid';
import { Controller } from './controllers';
import { linkedin } from './linkedin';
import { Config } from '@serverless-stack/node/config';
import { OidcProvider } from 'common';

export function getOidcController() {
  // which provider are we handling?
  const oidcProviderName = (Config as any).OIDC_PROVIDER as OidcProvider;
  switch (oidcProviderName) {
    // not yet supported (but easily added) https://github.com/jetbridge/cognito-oidc-cdk-construct/blob/master/src/github.ts
    // case 'GITHUB':
    //   return Controller(new OpenID(github));
    case 'LINKEDIN':
      return Controller(new OpenID(linkedin));
    default:
      throw new Error(`Unknown OIDC provider ${oidcProviderName}`);
  }
}
