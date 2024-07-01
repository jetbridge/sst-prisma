import { getPrisma } from '@backend/db/client';
import { defaultLambdaMiddleware } from '@backend/middleware/lambda';
import { PreSignUpTriggerHandler } from 'aws-lambda';

export const preSignUpInner: PreSignUpTriggerHandler = async (event) => {
  const attributes = event.request.userAttributes;
  const username = event.userName;
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
    console.info(`Verified user ${username} with email ${email}`);
  }

  const prisma = await getPrisma();

  // does a user already exist in the DB?
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });

  // save in DB
  if (existingUser) {
    // update if needed
    if (existingUser.name != name || existingUser.avatarUrl != picture) {
      await prisma.user.update({ data: { name, avatarUrl: picture }, where: { id: existingUser.id } });
    }
  } else {
    // create
    await prisma.user.create({ data: { email, avatarUrl: picture, name, username } });
  }

  return event;
};
export const handler = defaultLambdaMiddleware()(preSignUpInner);
