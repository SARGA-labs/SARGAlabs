/**
 * PBKDF2 password hashing using Web Crypto API.
 * Stores as "base64salt:base64hash" so salt and hash travel together.
 */

function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i] as number)
  }
  return btoa(binary)
}

function fromBase64(b64: string): Uint8Array {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

const ITERATIONS = 100_000
const HASH_ALGO = 'SHA-256'
const KEY_LENGTH = 256 // bits

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(16))

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )

  const hash = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as any, iterations: ITERATIONS, hash: HASH_ALGO },
    key,
    KEY_LENGTH
  )

  return `${toBase64(salt.buffer)}:${toBase64(hash)}`
}

export async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {
  const [saltB64, expectedHashB64] = stored.split(':')
  if (!saltB64 || !expectedHashB64) return false

  const encoder = new TextEncoder()
  const salt = fromBase64(saltB64)

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )

  const hash = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as any, iterations: ITERATIONS, hash: HASH_ALGO },
    key,
    KEY_LENGTH
  )

  const actualHashB64 = toBase64(hash)
  // Constant-time comparison
  if (actualHashB64.length !== expectedHashB64.length) return false
  let mismatch = 0
  for (let i = 0; i < actualHashB64.length; i++) {
    mismatch |= actualHashB64.charCodeAt(i) ^ expectedHashB64.charCodeAt(i)
  }
  return mismatch === 0
}
