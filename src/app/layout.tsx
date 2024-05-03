import '~/css/global.scss'

import type { Metadata } from 'next'

import { isDev, siteURL } from '~/lib/constants'

const Footer = dynamic(() => import('~/components/common/Footer'), {
  ssr: false
})

const GridDebugger = dynamic(() => import('~/lib/debug/grid-debugger'), {
  ssr: false
})

import dynamic from 'next/dynamic'

import Header from '~/components/common/Header'
import PasswordWrapper from '~/components/common/Password/PasswordWrapper'

import { AppHooks } from './app-hooks'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: {
    default: 'next-typescript | basement.studio',
    template: '%s | basement.studio'
  },
  metadataBase: siteURL,
  description: `A minimalist's boilerplate — Next.js with TypeScript.`,
  icons: [
    {
      rel: 'apple-touch-icon',
      url: '/apple-touch-icon.png'
    }
  ],
  manifest: '/manifest.webmanifest',
  twitter: {
    card: 'summary_large_image',
    title: 'next-typescript | basement.studio',
    creator: '@basementstudio',
    siteId: '@basementstudio'
  }
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body>
        <Providers>
          <PasswordWrapper>
            <Header />
            <main>{children}</main>
            {isDev && <GridDebugger />}
            <Footer />
            <AppHooks />
          </PasswordWrapper>
        </Providers>
      </body>
    </html>
  )
}

export default RootLayout
