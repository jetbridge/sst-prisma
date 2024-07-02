import { auth } from '@/auth'
import { authenticate, unauthenticate } from '@/app/serverActions'

interface Props {
  className?: string
}

export const Authentication = async ({ className }: Props) => {
  const session = await auth()

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
