'use client'

import { auth } from '@/auth'
import { authenticate, unauthenticate } from '../actions'
import { useSession } from 'next-auth/react'

interface Props {
  className?: string
}

export const Authentication = ({ className }: Props) => {
  const { data: session } = useSession()

  return (
    <div className={className}>
      {session ? (
        <form action={unauthenticate} className="flex flex-col items-end">
          <span className="font-bold">{session.user.email}</span>

          <button type="submit">Sign Out</button>
        </form>
      ) : (
        <form action={authenticate}>
          <button type="submit">Sign In</button>
        </form>
      )}
    </div>
  )
}
