'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

export async function authenticate() {
  try {
    console.log('authenticating cognito');

    await signIn('cognito', {
      redirectTo: '/',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}
