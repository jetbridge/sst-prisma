import NextAuth from 'next-auth';
import CognitoProvider from 'next-auth/providers/cognito';
import { COGNITO_CLIENT_ID, COGNITO_USER_POOL_ID, REGION } from 'web/lib/config/next';

if (!REGION) throw new Error('REGION is not set');
if (!COGNITO_CLIENT_ID) throw new Error('COGNITO_CLIENT_ID is not set');
if (!COGNITO_USER_POOL_ID) throw new Error('COGNITO_USER_POOL_ID is not set');

console.log('NEXTAUTH_SECRET', process.env.NEXTAUTH_SECRET);

export default NextAuth({
  providers: [
    CognitoProvider({
      clientId: COGNITO_CLIENT_ID,
      issuer: `https://cognito-idp.${REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}`,
      clientSecret: 'NOT_USED', // hopefully not used for anything?
    }),
  ],
  pages: {
    signIn: '/login',
  },
});
