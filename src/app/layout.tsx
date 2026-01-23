import '~/css/global.scss'

import { Analytics } from '@vercel/analytics/react'
import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'

import { Container } from '~/components/container'
import { siteURL } from '~/lib/constants'

import { AppHooks } from './app-hooks'
import { Providers } from './providers'

export const metadata: Metadata = {
  metadataBase: siteURL,
  title: {
    default: 'SARGA(labs)©',
    template: '%s | SARGA(labs)©'
  },
  description: `SARGA(labs)© is a solo-run Studio. COULD. /+ MUST./+ WILL./^*`,
  icons: [
    {
      rel: 'apple-touch-icon',
      url: '/apple-touch-icon.png'
    }
  ],
  manifest: '/manifest.webmanifest',
  twitter: {
    card: 'summary_large_image',
    title: 'SARGA(labs)©',
    creator: '@sargalabs',
    siteId: '@sargalabs',
    description:
      'SARGA(labs)© is a solo-run Studio. COULD. /+ MUST./+ WILL./^*',
    images: [
      {
        url: `/opengraph-image.png`
      }
    ]
  },
  authors: [
    {
      name: 'SARGA(labs)©',
      url: 'https://sar.ga'
    }
  ],
  keywords: [
    'artists',
    'artist',
    'creative',
    'outdated',
    'creative director',
    'shopify',
    'shopify partner',
    'shopify developer',
    'developer',
    'web developer',
    'website developer',
    'web designer',
    'website designer',
    'ui/ux',
    'diyuksh',
    'DIYUKSH',
    'headless website developer',
    'sarga labs',
    'sargalabs'
  ],
  creator: 'SARGA(labs)©',
  publisher: 'SARGA(labs)',
  openGraph: {
    description:
      'SARGA(labs)© is a solo-run Studio. COULD. /+ MUST./+ WILL./^*'
  },
  abstract: 'SARGA(labs)© is a solo-run Studio. COULD. /+ MUST./+ WILL./^*',
  verification: {
    other: {
      'p:domain_verify': '31e48b9066900bdde9609249258f5322'
    }
  }
}

export const viewport: Viewport = {
  themeColor: '#000'
}

const unica77 = localFont({
  variable: '--font-body',
  preload: true,
  src: [
    {
      path: '../../public/font/Unica77-LL.woff',
      style: 'normal'
    },
    {
      path: '../../public/font/Unica77-LL.woff2',
      style: 'normal'
    }
  ]
})

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body className={unica77.variable}>
        <Providers>
          <Container
            style={{
              width: '100%',
              height: '100vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'fixed',
              inset: 0
            }}
          >
            <h1>SARGA 2026</h1>
          </Container>
          {children}
          <AppHooks />
          <Analytics />
        </Providers>
      </body>
    </html>
  )
}

export default RootLayout
