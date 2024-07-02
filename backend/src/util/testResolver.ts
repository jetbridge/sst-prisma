import { AppSyncResolverHandler, Context } from 'aws-lambda'

type InferFunc<T> = T extends (...p: infer P) => infer R | void ? (...p: P) => R : never

export interface CallAuthenticatedResolver<A, R, S> {
  userName: string
  resolverFunc: InferFunc<AppSyncResolverHandler<A, R, S>>
  args: A
  source?: S
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
}: CallAuthenticatedResolver<A, R, S>) =>
  resolverFunc(
    {
      arguments: args,
      identity: {
        sub: userName,
        issuer: 'King Mischa',
        sourceIp: ['1.2.3.4'],
        defaultAuthStrategy: 'whatever',
        groups: [],
        claims: { 'cognito:username': userName },
        username: userName,
      },
      source,
      info: { selectionSetList: [] } as any,
      prev: {} as any,
      request: {} as any,
      stash: {} as any,
    },
    {} as Context,
    () => {
      throw new Error("don't call lambda callback")
    },
  )
