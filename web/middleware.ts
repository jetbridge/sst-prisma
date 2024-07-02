import NextAuth from 'next-auth'
import { authConfig } from './auth.config'

export default NextAuth(authConfig).auth

export const config = {
  // require login for these paths
  // https://nextjs.org/docs/app/building-your-application/routing/middleware
  matcher: ['/sample-protected-page/:path'],
}
