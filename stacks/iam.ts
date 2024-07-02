import { Function, StackContext } from 'sst/constructs'

export function Iam({ stack }: StackContext) {
  // default role for lambda functions
  // so we don't end up with >1000 roles
  // HACK to make a role that inherits permissions/config from the app
  // by making an empty function
  // more info: https://discord.com/channels/983865673656705025/1027663092957581383
  const placeholderFn = new Function(stack, 'IamDefault', {
    handler: 'backend/src/api/internalFunctions/empty.handler',
  })

  return {
    defaultLambdaRole: placeholderFn.role!,
  }
}
