// import { github } from './github';
import { ENV_OIDC_PROVIDER, OidcProvider } from '../types';
import { OpenID } from '../openid';
import { Controller } from './controllers';
import { linkedin } from './linkedin';

export function getOidcController() {
  // which provider are we handling?
  const oidcProviderName = process.env[ENV_OIDC_PROVIDER] as OidcProvider;
  if (!oidcProviderName) throw new Error(`Missing ${ENV_OIDC_PROVIDER} in environment`);
  switch (oidcProviderName) {
    // not yet supported (but easily added) https://github.com/jetbridge/cognito-oidc-cdk-construct/blob/master/src/github.ts
    // case 'GITHUB':
    //   return Controller(new OpenID(github));
    case 'LINKEDIN':
      return Controller(new OpenID(linkedin));
    default:
      throw new Error(`Unknown ${ENV_OIDC_PROVIDER} ${oidcProviderName}`);
  }
}
