import '~/css/global.scss'

import { Analytics } from '@vercel/analytics/react'
import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'

import { Container } from '~/components/container'

import { AppHooks } from './app-hooks'
import { Providers } from './providers'
import { headers } from 'next/headers'

async function getBaseUrlFromHeaders() {
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'sar.ga'
  const proto = h.get('x-forwarded-proto') ?? 'https'
  return new URL(`${proto}://${host}`)
}

export async function generateMetadata(): Promise<Metadata> {
  const metadataBase = await getBaseUrlFromHeaders()

  return {
    metadataBase,
    title: {
      default: 'SARGA',
      template: 'SARGA %s'
    },
    description: `A system for making.`,
    icons: [
      {
        rel: 'apple-touch-icon',
        url: '/apple-touch-icon.png'
      }
    ],
    manifest: '/manifest.webmanifest',
    twitter: {
      card: 'summary_large_image',
      title: 'SARGA',
      creator: '@sargalabs',
      siteId: '@sargalabs',
      description: 'A system for making.',
      images: [
        {
          url: `/opengraph-image.png`
        }
      ]
    },
    authors: [
      {
        name: 'SARGA',
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
    creator: 'SARGA',
    publisher: 'SARGA',
    openGraph: {
      description: 'A system for making.'
    },
    abstract: 'A system for making.',
    verification: {
      other: {
        'p:domain_verify': '31e48b9066900bdde9609249258f5322'
      }
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
              inset: 0,
              pointerEvents: 'none'
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
