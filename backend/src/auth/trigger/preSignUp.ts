/* eslint-disable @typescript-eslint/no-unused-vars */
import { getPrisma } from '@backend/db/client';
import { defaultLambdaMiddleware } from '@backend/middleware/lambda';
import { PreSignUpTriggerHandler } from 'aws-lambda';

export const preSignUpInner: PreSignUpTriggerHandler = async (event) => {
  const attributes = event.request.userAttributes;
  const userName = event.userName;
  const source = event.triggerSource;
  const { email, picture, name } = attributes;

  if (!email)
    throw new Error(
      `Didn't get email address in pre-signup cognito handler. Attributes: ${JSON.stringify(attributes)}`
    );

  if (source == 'PreSignUp_ExternalProvider') {
    // external provider like google, github, linkedin
    // we'll go ahead and assume the email is verified
    event.response.autoVerifyEmail = true;
    event.response.autoConfirmUser = true;
    console.info(`Verified user ${userName} with email ${email}`);
  }

  const prisma = await getPrisma();
  const userInvite = await prisma.user.find;

  // does a user already exist in the DB?
  let existingUser = await userRepo.getUserByCognitoUserName(userName);

  // TEMP for migration: get existing user by email
  existingUser ||= await userRepo.getUserByEmail(email);
  if (existingUser) {
    // generally this shouldn't happen but our lambda trigger needs to
    // not blow up if called multiple times
    console.warn(`Skipping saving user in DB as username ${userName} for email ${email} already exists`);
  } else {
    const userCreate: UserCreate = { emailAddress: email, avatarUrl: picture, name, userName };
    // create user in DB and mark invite as used
    await prisma.user.create(userCreate, userInvite);
  }

  return event;
};
export const handler = defaultLambdaMiddleware()(preSignUpInner);
