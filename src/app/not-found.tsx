import { headers } from 'next/headers'
import Link from '~/components/primitives/link'

async function getBaseUrlFromHeaders() {
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'sar.ga'
  return { hostname: host }
}

export default async function UnknownSubdomainNotFound() {
  const metadataBase = await getBaseUrlFromHeaders()
  const rawTitle = metadataBase.hostname
    .toUpperCase()
    .split('.')[0]
    ?.replace('SAR', '')
  const title = rawTitle?.includes('LOCALHOST') ? '404' : rawTitle

  return (
    <main style={{ padding: 24 }}>
      <h1>{title}</h1>
      <Link href="https://sar.ga/">← SAR.GA</Link>
    </main>
  )
}
