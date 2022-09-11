import { AppSyncResolverEvent, AppSyncIdentityCognito } from 'aws-lambda';
import { User } from '@prisma/client';
import { UserRepository } from '@backend/repository/user';

// loads user from an AppSync resolver event
export const getCurrentUser = async (event: AppSyncResolverEvent<unknown>): Promise<User | undefined> => {
  // get username
  const cognitoUserName = (event.identity as AppSyncIdentityCognito).username;
  // username might not exist might not exist if the request is authenticated in some other way, like IAM or API key
  if (!cognitoUserName) return undefined;

  // load user from DB
  const userRepository = new UserRepository();
  const user = await userRepository.getUserByCognitoUsername(cognitoUserName);
  if (!user) throw new Error(`User with username ${cognitoUserName} not found`);

  return user;
};

export const requireCurrentUser = async (event: AppSyncResolverEvent<unknown>): Promise<User> => {
  const user = await getCurrentUser(event);
  if (!user) throw new Error('Unauthorized');
  return user;
};
