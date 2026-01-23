import Link from '~/components/primitives/link'

export const dynamic = 'force-static'

export default function UnknownSubdomainNotFound() {
  return (
    <main style={{ padding: 24 }}>
      <h1>404</h1>
      <Link href="/">GO BACK</Link>
    </main>
  )
}
