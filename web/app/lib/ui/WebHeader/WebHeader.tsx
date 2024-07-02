import { auth } from '@/auth'
import { Authentication } from '../Authentication/Authentication'
import { WebNavigation } from './WebNavigation'

export const WebHeader = async () => {
  const session = await auth()

  return (
    <header className="relative">
      {session?.user ? <WebNavigation /> : null}

      <Authentication className="w-fit absolute right-6 top-6" />
    </header>
  )
}
