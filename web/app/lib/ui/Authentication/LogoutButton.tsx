import { unauthenticate } from '@/app/serverActions'

interface Props {
  userEmail: string
}

export const LogoutButton = async ({ userEmail }: Props) => {
  return (
    <form action={unauthenticate} className="flex flex-col items-end">
      <span className="font-bold">{userEmail}</span>

      <button type="submit">Sign Out</button>
    </form>
  )
}
