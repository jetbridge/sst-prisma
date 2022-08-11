import { got } from 'got';

export const parseResponse = (resolve: any, reject: any) => (response: any) => {
  if (response.body) {
    resolve(JSON.parse(response.body));
  } else {
    reject({ reason: "response doesn't have a body" });
  }
};

export const get = async (url: string, accessToken: string) => {
  const res = await got.get(url, {
    headers: {
      Accept: 'application/json',
      Authorization: `token ${accessToken}`,
    },
  });
  return JSON.parse(res.body);
};

export const post = async (url: string, data?: any) => {
  const res = await got.post(url, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    ...(data ? { json: data } : {}),
  });
  return JSON.parse(res.body);
};
