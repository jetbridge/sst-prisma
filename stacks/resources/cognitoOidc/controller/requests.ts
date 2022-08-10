import got from "got"

export const parseResponse = (resolve: any, reject: any) => (response: any) => {
  if (response.body) {
    resolve(JSON.parse(response.body))
  } else {
    reject({ reason: "response doesn't have a body" })
  }
}

export const get = (url: string, accessToken: string) =>
  new Promise((resolve, reject) => {
    got
      .get(url, {
        headers: {
          Accept: "application/json",
          Authorization: `token ${accessToken}`,
        },
      })
      .then(parseResponse(resolve, reject))
  })

export const post = (url: string, data?: any) =>
  new Promise((resolve, reject) => {
    got
      .post(url, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        ...(data ? { json: data } : {}),
      })
      .then(parseResponse(resolve, reject))
  })
