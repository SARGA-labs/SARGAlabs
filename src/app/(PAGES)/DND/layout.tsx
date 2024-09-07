import '~/css/global.scss'

import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'

import { isDev, siteURL } from '~/lib/constants'
const Footer = dynamic(() => import('~/components/common/Footer'), {
  ssr: false
})

const GridDebugger = dynamic(() => import('~/lib/debug/grid-debugger'), {
  ssr: false
})

import dynamic from 'next/dynamic'

import Header from '~/components/common/Header'
import { Providers } from '~/app/providers'
import { AppHooks } from '~/app/app-hooks'


export const metadata: Metadata = {
  metadataBase: siteURL,
  title: {
    default: 'SARGA(labs)© LLC.',
    template: '%s | SARGA(labs)© LLC.'
  },
  description: `SARGA(labs)© LLC. is a solo-run Studio. COULD. /+ MUST./+ WILL./^*`,
  icons: [
    {
      rel: 'apple-touch-icon',
      url: '/apple-touch-icon.png'
    }
  ],
  manifest: '/manifest.webmanifest',
  twitter: {
    card: 'summary_large_image',
    title: 'SARGA(labs)© LLC.',
    creator: '@sargalabs',
    siteId: '@sargalabs',
    description:
      'SARGA(labs)© LLC. is a solo-run Studio. COULD. /+ MUST./+ WILL./^*',
    images: [
      {
        url: `/opengraph-image.png`
      }
    ]
  },
  authors: [
    {
      name: 'SARGA(labs)© LLC.',
      url: 'https://sargalabs.co'
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
  creator: 'SARGA(labs)© LLC.',
  publisher: 'SARGA(labs)© LLC.',
  openGraph: {
    description:
      'SARGA(labs)© LLC. is a solo-run Studio. COULD. /+ MUST./+ WILL./^*'
  },
  abstract:
    'SARGA(labs)© LLC. is a solo-run Studio. COULD. /+ MUST./+ WILL./^*',
  verification: {
    other: {
      'p:domain_verify': '31e48b9066900bdde9609249258f5322'
    }
  }
}

export const viewport: Viewport = {
  themeColor: '#989898'
}

const unica77 = localFont({
  variable: '--font-body',
  preload: true,
  src: [
    {
      path: '../../../../public/font/Unica77-LL.woff',
      style: 'normal'
    },
    {
      path: '../../../../public/font/Unica77-LL.woff2',
      style: 'normal'
    }
  ]
})

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body className={unica77.variable}>
        <Providers>
          <main>{children}</main>
          {isDev && <GridDebugger />}
          <AppHooks />
        </Providers>
      </body>
    </html>
  )
}

export default RootLayout
