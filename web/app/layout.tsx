import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SessionWrapper from './lib/providers/SessionProvider'
import { ApolloClientProvider } from './lib/providers/ApolloClientProvider'
import clsx from 'clsx'
import { WebHeader } from './lib/ui/WebHeader/WebHeader'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SST App',
  description: 'Powered by JetBridge SST Template',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SessionWrapper>
      <ApolloClientProvider>
        <html lang="en">
          <body className={clsx(inter.className, 'bg-slate-700')}>
            <div className="flex flex-col h-full">
              <WebHeader />

              {children}
            </div>
          </body>
        </html>
      </ApolloClientProvider>
    </SessionWrapper>
  )
}
