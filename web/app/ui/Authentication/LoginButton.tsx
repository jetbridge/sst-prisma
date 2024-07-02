'use client'

import { authenticate } from '@/app/serverActions'
import { useSearchParams } from 'next/navigation'

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
