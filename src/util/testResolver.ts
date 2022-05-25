/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppSyncIdentity, AppSyncResolverEvent, Callback, Context } from 'aws-lambda';

export interface TestCallResolverArgs<A, R, S> {
  userName?: string;
  resolverFunc: (event: AppSyncResolverEvent<A, S>, context?: Context, callback?: Callback) => R;
  args: A;
  source?: S;
}

/**
 * Helper method to create props passed to resolvers with arguments and auth data.
 * @param args arguments passed to resolver
 * @param userName for current user
 */
export const testCallResolver = <A, R, S>({
  userName,
  args,
  source = null as unknown as S,
  resolverFunc,
}: TestCallResolverArgs<A, R, S>) =>
  resolverFunc(
    {
      arguments: args,
      identity: userName
        ? {
            sub: userName,
            issuer: 'King Mischa',
            sourceIp: ['1.2.3.4'],
            defaultAuthStrategy: 'whatever',
            groups: [],
            claims: { 'cognito:username': userName },
            username: userName,
          }
        : ({} as AppSyncIdentity),
      source,
      info: {} as any,
      prev: {} as any,
      request: {} as any,
      stash: {} as any,
    },
    {} as Context,
    () => {
      throw new Error("don't call lambda callback");
    }
  );
