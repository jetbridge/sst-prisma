'use server'

import { signIn, signOut } from '@/app/lib/auth/next'
import { AuthError } from 'next-auth'

export async function authenticate(redirectTo?: string) {
  try {
    await signIn('cognito', { redirectTo })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.'
        default:
          return 'Something went wrong.'
      }
    }
    throw error
  }
}

export async function unauthenticate() {
  await signOut({ redirectTo: '/' })
}
