import { got } from 'got';

export const get = async (url: string, accessToken: string) => {
  const res = await got.get(url, {
    headers: {
      Accept: 'application/json',
      Authorization: `token ${accessToken}`,
    },
  });
  return JSON.parse(res.body);
};

export const post = async (url: string, data?: unknown) => {
  const res = await got.post(url, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    ...(data ? { json: data } : {}),
  });
  return JSON.parse(res.body);
};
