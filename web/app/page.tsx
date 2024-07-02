import Home from '@/lib/component/home/Home'
import { PageProps } from './types'

export default function Page({ searchParams = {} }: PageProps<{ callbackUrl?: string }>) {
  const { callbackUrl } = searchParams

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Home />
    </main>
  )
}
