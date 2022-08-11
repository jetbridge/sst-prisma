// import { github } from './github';
import { linkedin } from './linkedin';
import { OpenID } from '../openid';
import { Callback } from 'aws-lambda';
import { responder } from './responder';
import { ENV_OIDC_PROVIDER, OidcProvider } from '../../types';
import { Controller } from './controllers';

export function getOidcControllerType() {
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

export function getOidcController(callback: Callback) {
  const controller = getOidcControllerType();
  return controller(responder(callback));
}
