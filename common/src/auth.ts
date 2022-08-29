// `openid` is an scope required by Cognito
// but Linkedin throws an error if this scope is passed as it is not recognized
// so it needs to be filtered out in the getAuthorizeUrl function
export const linkedinScope = ['openid', 'r_liteprofile', 'r_emailaddress'];

// supported providers
export type OidcProvider = 'GITHUB' | 'LINKEDIN';
