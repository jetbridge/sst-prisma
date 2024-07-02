'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export const WebNavigation = () => {
  const pathname = usePathname()

  let url: string
  let text: string

  if (pathname === '/') {
    url = '/sample-protected-page'
    text = 'Sample Protected Page'
  } else {
    url = '/'
    text = 'Home Page'
  }

  return (
    <Link href={url} className="underline w-fit absolute left-6 top-6 hover:text-slate-300">
      {text}
    </Link>
  )
}
