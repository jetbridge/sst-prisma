'use client'

import { useSearchParams } from 'next/navigation'
import { authenticate } from '@/app/lib/actions/auth'

export const LoginButton = () => {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? undefined
  const _authenticate = authenticate.bind(null, callbackUrl)

  return (
    <form action={_authenticate}>
      <button type="submit">Sign In</button>
    </form>
  )
}
