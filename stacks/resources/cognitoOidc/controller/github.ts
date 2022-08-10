import { URLSearchParams } from "url"
import * as req from "./requests"
import * as consts from "./consts"
import * as crypto from "./crypto"
import { jsToUnixTimestamp } from "./helpers"
import { cognitoRedirectUri } from "./types"

export const githubScope = "openid read:user user:email"

const getApiEndpoints = (apiBaseUrl: string, loginBaseUrl: string) => ({
  userDetails: `${apiBaseUrl}/user`,
  userEmails: `${apiBaseUrl}/user/emails`,
  oauthToken: `${loginBaseUrl}/login/oauth/access_token`,
  oauthAuthorize: `${loginBaseUrl}/login/oauth/authorize`,
})

const urls = getApiEndpoints(consts.githubApiUrl, consts.githubLoginUrl)

const getUserDetails = (accessToken: any) => req.get(urls.userDetails, accessToken)

const getUserEmails = (accessToken: any) => req.get(urls.userEmails, accessToken)

export const github = (secrets: any) => {
  const cert = secrets.JWT_KEY
  const clientId = secrets.GITHUB_CLIENT_ID
  return {
    getAuthorizeUrl: (client_id: any, scope: any, state: any, response_type: any) => {
      const queryParameters = new URLSearchParams()
      queryParameters.append("client_id", client_id)
      queryParameters.append("scope", scope)
      queryParameters.append("state", state)
      queryParameters.append("response_type", response_type)
      return `${urls.oauthAuthorize}?${queryParameters.toString()}`
    },
    getUserInfo: (accessToken: any) => {
      return Promise.all([
        getUserDetails(accessToken).then((userDetails: any) => {
          console.debug("Fetched user details: %j", userDetails, {})
          // Here we map the github user response to the standard claims from
          // OpenID. The mapping was constructed by following
          // https://developer.github.com/v3/users/
          // and http://openid.net/specs/openid-connect-core-1_0.html#StandardClaims
          const claims = {
            sub: `${userDetails.id}`, // OpenID requires a string
            name: userDetails.name,
            preferred_username: userDetails.login,
            profile: userDetails.html_url,
            picture: userDetails.avatar_url,
            website: userDetails.blog,
            updated_at: jsToUnixTimestamp(
              // OpenID requires the seconds since epoch in UTC
              new Date(Date.parse(userDetails.updated_at)).getTime()
            ),
          }
          console.debug("Resolved claims: %j", claims, {})
          return claims
        }),
        getUserEmails(accessToken).then((userEmails: any) => {
          console.debug("Fetched user emails: %j", userEmails, {})
          const primaryEmail = userEmails.find((email: any) => email.primary)
          if (primaryEmail === undefined) {
            throw new Error("User did not have a primary email address")
          }
          const claims = {
            email: primaryEmail.email,
            email_verified: primaryEmail.verified,
          }
          console.debug("Resolved claims: %j", claims, {})
          return claims
        }),
      ])
        .then((claims) => {
          const mergedClaims = claims.reduce((acc, claim) => ({ ...acc, ...claim }), {})
          console.debug("Resolved combined claims: %j", mergedClaims, {})
          return mergedClaims
        })
        .catch((error: any) => {
          console.error(error)
          throw Error(error)
        })
    },
    getToken: (code: any, state: any, host: any) => {
      const data = {
        // OAuth required fields
        grant_type: "authorization_code",
        redirect_uri: process.env[cognitoRedirectUri],
        client_id: secrets.GITHUB_CLIENT_ID,
        // GitHub Specific
        response_type: "code",
        client_secret: secrets.GITHUB_CLIENT_SECRET,
        code,
        // State may not be present, so we conditionally include it
        ...(state && { state }),
      }

      return req.post(urls.oauthToken, data).then((githubToken: any) => {
        return new Promise((resolve) => {
          const payload = {
            // This was commented because Cognito times out in under a second
            // and generating the userInfo takes too long.
            // It means the ID token is empty except for metadata.
            //  ...userInfo,
          }
          const idToken = crypto.makeIdToken(payload, host, cert, clientId)
          const tokenResponse = {
            ...githubToken,
            // GitHub returns scopes separated by commas
            // But OAuth wants them to be spaces
            // https://tools.ietf.org/html/rfc6749#section-5.1
            // Also, we need to add openid as a scope,
            // since GitHub will have stripped it
            scope: `openid ${githubToken.scope.replace(",", " ")}`,
            id_token: idToken,
          }
          console.debug("Resolved token response: %j", tokenResponse, {})
          resolve(tokenResponse)
        })
      })
    },
  }
}
