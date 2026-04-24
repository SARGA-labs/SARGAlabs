/**
 * Universal URL helper for SARGA's subdomain-based routing.
 *
 * The proxy.ts middleware rewrites subdomain requests:
 *   portal.sar.local:3000/auth  →  internally serves /portal/auth
 *   design.sar.local:3000/      →  internally serves /design
 *
 * Because of this, client-side navigation must use paths WITHOUT
 * the subdomain prefix (e.g. "/auth" not "/portal/auth"), since
 * the browser URL never shows "/portal/...".
 *
 * For building full external/shareable URLs (e.g. for copying a link),
 * we construct: https://<subdomain>.<apex>/<path>
 */

const ALLOWED_SUBDOMAINS = [
  'studio',
  'support',
  'write',
  'research',
  'club',
  'portal',
  'design'
] as const

export type Subdomain = (typeof ALLOWED_SUBDOMAINS)[number]

/**
 * Detect the current apex domain from the browser.
 * Returns "sar.local:3000" in dev, "sar.ga" in prod.
 */
function getApex(): string {
  if (typeof window === 'undefined') return 'sar.ga'
  const host = window.location.host // includes port
  const hostname = window.location.hostname

  // dev: portal.sar.local -> sar.local:3000
  if (hostname.endsWith('.sar.local')) {
    const port = window.location.port
    return `sar.local${port ? `:${port}` : ''}`
  }

  // dev: portal.localhost -> localhost:3000
  if (hostname.endsWith('.localhost')) {
    const port = window.location.port
    return `localhost${port ? `:${port}` : ''}`
  }

  // prod: portal.sar.ga -> sar.ga
  const parts = hostname.split('.')
  if (parts.length >= 3) {
    return (
      parts.slice(1).join('.') +
      (window.location.port ? `:${window.location.port}` : '')
    )
  }

  // fallback: apex itself
  return host
}

/**
 * Detect which subdomain we're currently on (or empty string for apex).
 */
function getCurrentSubdomain(): string {
  if (typeof window === 'undefined') return ''
  const hostname = window.location.hostname

  if (hostname.endsWith('.sar.local')) return hostname.replace('.sar.local', '')
  if (hostname.endsWith('.localhost')) return hostname.replace('.localhost', '')

  const parts = hostname.split('.')
  if (parts.length >= 3) return parts[0] || ''
  return ''
}

/**
 * Build a full absolute URL for a given subdomain + path.
 * Use this for shareable/public links.
 *
 * Example:
 *   buildSubdomainUrl('portal', '/kensei/draft-001')
 *   → "http://portal.sar.local:3000/kensei/draft-001"  (dev)
 *   → "https://portal.sar.ga/kensei/draft-001"          (prod)
 */
export function buildSubdomainUrl(subdomain: Subdomain, path = '/'): string {
  if (typeof window === 'undefined') {
    return `https://${subdomain}.sar.ga${path}`
  }

  const protocol = window.location.protocol
  const apex = getApex()
  const cleanPath = path.startsWith('/') ? path : `/${path}`

  return `${protocol}//${subdomain}.${apex}${cleanPath}`
}

/**
 * Build a navigation path for use with router.push() or <Link href=>.
 * This returns a RELATIVE path (no subdomain prefix) because the
 * proxy middleware handles the rewrite transparently.
 *
 * If you're already on the correct subdomain, just return the path.
 * If you need to navigate to a DIFFERENT subdomain, return a full URL
 * (which will cause a full page navigation, not a client-side transition).
 *
 * Example (on portal.sar.local):
 *   navPath('/auth')                    → "/auth"
 *   navPath('/kensei/draft-001')        → "/kensei/draft-001"
 *   navPath('/admin')                   → "/admin"
 *   navPath('/colors', 'design')        → "http://design.sar.local:3000/colors"
 */
export function navPath(path: string, targetSubdomain?: Subdomain): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`

  // If no target subdomain specified, or we're already on it, return relative path
  if (!targetSubdomain) return cleanPath

  const current = getCurrentSubdomain()
  if (current === targetSubdomain) return cleanPath

  // Cross-subdomain navigation requires full URL
  return buildSubdomainUrl(targetSubdomain, cleanPath)
}

/**
 * Hook-friendly getter for the current subdomain.
 * Safe to call in SSR (returns empty string).
 */
export function getSubdomain(): string {
  return getCurrentSubdomain()
}
