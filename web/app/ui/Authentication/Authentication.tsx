import { auth } from '@/auth'
import { LoginButton } from './LoginButton'
import { LogoutButton } from './LogoutButton'

interface Props {
  className?: string
}

export const Authentication = async ({ className }: Props) => {
  const session = await auth()

  return <div className={className}>{session ? <LogoutButton userEmail={session.user.email} /> : <LoginButton />}</div>
}
